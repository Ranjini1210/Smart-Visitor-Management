import { Request, Response } from 'express';
import { VisitRepository } from '../repositories/visitRepository';
import { VisitorRepository } from '../repositories/visitorRepository';
import { NotificationRepository } from '../repositories/notificationRepository';
import { AuditLogRepository } from '../repositories/auditLogRepository';
import { cacheService } from '../config/redis';
import { generateQRToken, generateQRDataURL } from '../utils/qr';
import { AuthRequest } from '../middleware/auth';

export class CheckInController {
  // Search/Lookup visits by Email, Phone Number, or QR Token
  static async lookup(req: Request, res: Response) {
    try {
      const query = (req.query.q as string || req.query.email as string || '').trim().toLowerCase();
      if (!query) {
        return res.status(400).json({ success: false, message: 'Search query or email is required' });
      }

      const allVisits = await VisitRepository.findAll();
      const matched = allVisits.filter((v) => {
        const vEmail = (v.visitor_email || '').toLowerCase();
        const vPhone = (v.visitor_phone || '').toLowerCase();
        const vName = (v.visitor_name || '').toLowerCase();
        const vToken = (v.qr_token || '').toLowerCase();
        const vId = String(v.id);

        return (
          vEmail.includes(query) ||
          vPhone.includes(query) ||
          vName.includes(query) ||
          vToken.includes(query) ||
          vId === query
        );
      });

      return res.json({
        success: true,
        count: matched.length,
        data: matched
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Instant Check-In by Email, Phone, or Pass Token
  static async checkInByQuery(req: AuthRequest, res: Response) {
    try {
      const { email, phone, token, query } = req.body;
      const term = (query || email || phone || token || '').trim().toLowerCase();

      if (!term) {
        return res.status(400).json({ success: false, message: 'Please provide visitor email, phone number, or pass token' });
      }

      const allVisits = await VisitRepository.findAll();
      let visit = allVisits.find((v) => {
        const vEmail = (v.visitor_email || '').toLowerCase();
        const vPhone = (v.visitor_phone || '').toLowerCase();
        const vToken = (v.qr_token || '').toLowerCase();
        return (
          (vEmail && vEmail === term) ||
          (vPhone && vPhone === term) ||
          (vToken && vToken === term) ||
          vEmail.includes(term)
        );
      });

      // If no visit exists for this email, auto-create a walk-in visit and check them in
      if (!visit) {
        let visitor = await VisitorRepository.findByPhoneOrEmail(term, term);
        if (!visitor) {
          const generatedName = term.includes('@')
            ? term.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
            : 'Campus Guest';
          visitor = await VisitorRepository.create({
            name: generatedName,
            email: term.includes('@') ? term : `${term}@visitor.campus.edu`,
            phone: term.includes('@') ? '+91 98765 00000' : term,
            organization: 'Campus Visitor',
            id_type: 'Govt ID',
            id_number: 'N/A'
          });
        }

        const newVisit = await VisitRepository.create({
          visitor_id: visitor.id,
          purpose: 'General Visit',
          expected_date: new Date().toISOString().split('T')[0],
          expected_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'pending'
        });

        visit = (await VisitRepository.findById(newVisit.id))!;
      }

      if (visit.status === 'checked_in') {
        return res.json({
          success: true,
          message: `${visit.visitor_name} is already checked in.`,
          data: visit
        });
      }

      const checkInTime = new Date().toISOString();
      const updated = await VisitRepository.updateStatus(visit.id, 'checked_in', {
        check_in_at: checkInTime
      });

      await cacheService.incr('active_visitors_count');

      if (visit.host_id) {
        await NotificationRepository.create({
          user_id: visit.host_id,
          title: 'Visitor Arrived & Checked In',
          message: `${visit.visitor_name} (${visit.visitor_org || 'Visitor'}) has checked in at security gate.`,
          type: 'success'
        });
      }

      await AuditLogRepository.log({
        user_id: req.user?.id,
        action: 'VISITOR_CHECKED_IN',
        entity_type: 'VISIT',
        entity_id: visit.id,
        details: `Visitor ${visit.visitor_name} (${visit.visitor_email}) checked in by ${req.user?.name || 'Gate Terminal'}`
      });

      const qrImage = await generateQRDataURL(visit.qr_token);

      return res.json({
        success: true,
        message: `✓ ${visit.visitor_name} checked in successfully!`,
        data: {
          ...updated,
          qr_image: qrImage
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Instant Check-Out by Email, Phone, or Pass Token
  static async checkOutByQuery(req: AuthRequest, res: Response) {
    try {
      const { email, phone, token, query } = req.body;
      const term = (query || email || phone || token || '').trim().toLowerCase();

      if (!term) {
        return res.status(400).json({ success: false, message: 'Please provide visitor email, phone number, or pass token' });
      }

      const allVisits = await VisitRepository.findAll();
      const visit = allVisits.find((v) => {
        const vEmail = (v.visitor_email || '').toLowerCase();
        const vPhone = (v.visitor_phone || '').toLowerCase();
        const vToken = (v.qr_token || '').toLowerCase();
        return (
          v.status === 'checked_in' &&
          ((vEmail && vEmail === term) ||
            (vPhone && vPhone === term) ||
            (vToken && vToken === term) ||
            vEmail.includes(term))
        );
      }) || allVisits.find((v) => {
        const vEmail = (v.visitor_email || '').toLowerCase();
        return vEmail.includes(term) || (v.qr_token || '').toLowerCase().includes(term);
      });

      if (!visit) {
        return res.status(404).json({ success: false, message: 'No active visit found for this email or ID' });
      }

      if (visit.status === 'checked_out') {
        return res.json({
          success: true,
          message: `${visit.visitor_name} has already checked out.`,
          data: visit
        });
      }

      const checkOutTime = new Date().toISOString();
      const updated = await VisitRepository.updateStatus(visit.id, 'checked_out', {
        check_out_at: checkOutTime
      });

      await cacheService.decr('active_visitors_count');

      if (visit.host_id) {
        await NotificationRepository.create({
          user_id: visit.host_id,
          title: 'Visitor Checked Out',
          message: `${visit.visitor_name} has completed their visit and checked out.`,
          type: 'info'
        });
      }

      await AuditLogRepository.log({
        user_id: req.user?.id,
        action: 'VISITOR_CHECKED_OUT',
        entity_type: 'VISIT',
        entity_id: visit.id,
        details: `Visitor ${visit.visitor_name} checked out by ${req.user?.name || 'Gate Terminal'}`
      });

      return res.json({
        success: true,
        message: `✓ ${visit.visitor_name} checked out successfully!`,
        data: updated
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Standard ID-based Check-In
  static async checkIn(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const visit = await VisitRepository.findById(id);

      if (!visit) {
        return res.status(404).json({ success: false, message: 'Visit record not found' });
      }

      if (visit.status === 'checked_in') {
        return res.status(400).json({ success: false, message: 'Visitor is already checked in' });
      }

      if (visit.status === 'checked_out') {
        return res.status(400).json({ success: false, message: 'Visitor has already checked out' });
      }

      const checkInTime = new Date().toISOString();
      const updated = await VisitRepository.updateStatus(id, 'checked_in', {
        check_in_at: checkInTime
      });

      // Update Redis cached counter
      await cacheService.incr('active_visitors_count');

      // Send notification to Host
      if (visit.host_id) {
        await NotificationRepository.create({
          user_id: visit.host_id,
          title: 'Visitor Arrived & Checked In',
          message: `${visit.visitor_name} (${visit.visitor_org || 'Visitor'}) has arrived and checked in at security gate.`,
          type: 'success'
        });
      }

      await AuditLogRepository.log({
        user_id: req.user?.id,
        action: 'VISITOR_CHECKED_IN',
        entity_type: 'VISIT',
        entity_id: id,
        details: `Visitor ${visit.visitor_name} checked in by ${req.user?.name || 'Security'}`
      });

      return res.json({
        success: true,
        message: 'Visitor checked in successfully',
        data: updated
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Standard ID-based Check-Out
  static async checkOut(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const visit = await VisitRepository.findById(id);

      if (!visit) {
        return res.status(404).json({ success: false, message: 'Visit record not found' });
      }

      if (visit.status === 'checked_out') {
        return res.status(400).json({ success: false, message: 'Visitor has already checked out' });
      }

      const checkOutTime = new Date().toISOString();
      const updated = await VisitRepository.updateStatus(id, 'checked_out', {
        check_out_at: checkOutTime
      });

      // Update Redis cached counter
      await cacheService.decr('active_visitors_count');

      // Send notification to Host
      if (visit.host_id) {
        await NotificationRepository.create({
          user_id: visit.host_id,
          title: 'Visitor Checked Out',
          message: `${visit.visitor_name} has completed their visit and checked out.`,
          type: 'info'
        });
      }

      await AuditLogRepository.log({
        user_id: req.user?.id,
        action: 'VISITOR_CHECKED_OUT',
        entity_type: 'VISIT',
        entity_id: id,
        details: `Visitor ${visit.visitor_name} checked out by ${req.user?.name || 'Security'}`
      });

      return res.json({
        success: true,
        message: 'Visitor checked out successfully',
        data: updated
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
