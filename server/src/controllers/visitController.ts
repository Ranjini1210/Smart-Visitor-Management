import { Request, Response } from 'express';
import { VisitRepository } from '../repositories/visitRepository';
import { VisitorRepository } from '../repositories/visitorRepository';
import { UserRepository } from '../repositories/userRepository';
import { NotificationRepository } from '../repositories/notificationRepository';
import { AuditLogRepository } from '../repositories/auditLogRepository';
import { generateQRToken, generateQRDataURL } from '../utils/qr';
import { AuthRequest } from '../middleware/auth';
import { VisitStatus } from '../types';

export class VisitController {
  static async getAll(req: Request, res: Response) {
    try {
      const { status, hostId, search, date } = req.query;
      const visits = await VisitRepository.findAll({
        status: status as VisitStatus,
        hostId: hostId ? parseInt(hostId as string, 10) : undefined,
        search: search as string,
        date: date as string
      });
      return res.json({ success: true, data: visits });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const visit = await VisitRepository.findById(id);
      if (!visit) {
        return res.status(404).json({ success: false, message: 'Visit not found' });
      }
      const qrImage = await generateQRDataURL(visit.qr_token);
      return res.json({ success: true, data: { ...visit, qr_image: qrImage } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const {
        name,
        phone,
        email,
        organization,
        id_type,
        id_number,
        id_proof_url,
        host_id,
        purpose,
        expected_date,
        expected_time,
        duration,
        accompanying_count,
        vehicle_number,
        notes
      } = req.body;

      if (!name || !phone || !email || !purpose || !expected_date || !expected_time) {
        return res.status(400).json({ success: false, message: 'Required fields missing' });
      }

      const trimmedPhone = String(phone).trim();
      const trimmedEmail = String(email).trim();
      const trimmedName = String(name).trim();

      // Find or create visitor
      let visitor = await VisitorRepository.findByPhoneOrEmail(trimmedPhone, trimmedEmail);
      if (!visitor) {
        visitor = await VisitorRepository.create({
          name: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail,
          organization: organization?.trim() || 'Guest',
          id_type: id_type || 'Aadhaar / Govt ID',
          id_number: id_number?.trim() || 'N/A',
          id_proof_url: id_proof_url || ''
        });
      }

      const parsedHostId = host_id && !isNaN(parseInt(host_id, 10)) ? parseInt(host_id, 10) : null;
      const parsedAccompanying = accompanying_count && !isNaN(parseInt(accompanying_count, 10)) ? parseInt(accompanying_count, 10) : 0;

      // Initial temp token, will map to visit ID
      const tempToken = generateQRToken(Date.now());

      const visit = await VisitRepository.create({
        visitor_id: visitor.id,
        host_id: parsedHostId,
        purpose,
        expected_date,
        expected_time,
        duration: duration || '1 Hour',
        accompanying_count: parsedAccompanying,
        vehicle_number: vehicle_number?.trim() || '',
        notes: notes?.trim() || '',
        status: 'pending',
        qr_token: tempToken
      });

      // Update QR Token with actual visit id
      const realToken = generateQRToken(visit.id);
      visit.qr_token = realToken;

      // Send notifications to Host
      if (parsedHostId) {
        try {
          await NotificationRepository.create({
            user_id: parsedHostId,
            title: 'New Visitor Request',
            message: `Visitor ${visitor.name} (${visitor.organization}) requested a visit for ${expected_date} at ${expected_time}.`,
            type: 'info'
          });
        } catch (notifErr) {
          console.error('Host notification error:', notifErr);
        }
      }

      // Send notification to Admin
      try {
        const allUsers = await UserRepository.findAll();
        const adminUsers = allUsers.filter((u) => u.role === 'admin');
        for (const admin of adminUsers) {
          await NotificationRepository.create({
            user_id: admin.id,
            title: 'New Visitor Registration',
            message: `${visitor.name} registered to visit ${parsedHostId ? 'Host ID #' + parsedHostId : 'Campus'}.`,
            type: 'info'
          });
        }
      } catch (adminErr) {
        console.error('Admin notification error:', adminErr);
      }

      try {
        await AuditLogRepository.log({
          action: 'VISITOR_REGISTERED',
          entity_type: 'VISIT',
          entity_id: visit.id,
          details: `Visitor ${trimmedName} registered visit #${visit.id} for host ID ${parsedHostId}`
        });
      } catch (auditErr) {
        console.error('Audit log error:', auditErr);
      }

      let qrDataURL = '';
      try {
        qrDataURL = await generateQRDataURL(realToken);
      } catch (qrErr) {
        console.error('QR Data URL error:', qrErr);
      }

      return res.status(201).json({
        success: true,
        message: 'Visit request submitted successfully',
        data: {
          ...visit,
          visitor_name: visitor.name,
          visitor_email: visitor.email,
          qr_image: qrDataURL
        }
      });
    } catch (error: any) {
      console.error('Error creating visit:', error);
      return res.status(500).json({ success: false, message: error.message || 'Failed to register visit' });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (!['pending', 'approved', 'rejected', 'checked_in', 'checked_out'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }

      const visit = await VisitRepository.findById(id);
      if (!visit) {
        return res.status(404).json({ success: false, message: 'Visit not found' });
      }

      const updated = await VisitRepository.updateStatus(id, status);

      await AuditLogRepository.log({
        user_id: req.user?.id,
        action: `VISIT_STATUS_${status.toUpperCase()}`,
        entity_type: 'VISIT',
        entity_id: id,
        details: `Visit #${id} status updated to ${status} by ${req.user?.name || 'System'}`
      });

      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
