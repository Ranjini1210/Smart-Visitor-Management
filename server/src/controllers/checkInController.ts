import { Response } from 'express';
import { VisitRepository } from '../repositories/visitRepository';
import { NotificationRepository } from '../repositories/notificationRepository';
import { AuditLogRepository } from '../repositories/auditLogRepository';
import { cacheService } from '../config/redis';
import { AuthRequest } from '../middleware/auth';

export class CheckInController {
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
