import { Response } from 'express';
import { VisitRepository } from '../repositories/visitRepository';
import { NotificationRepository } from '../repositories/notificationRepository';
import { AuditLogRepository } from '../repositories/auditLogRepository';
import { generateQRDataURL } from '../utils/qr';
import { AuthRequest } from '../middleware/auth';

export class ApprovalController {
  static async getPending(req: AuthRequest, res: Response) {
    try {
      const isHost = req.user?.role === 'host';
      const visits = await VisitRepository.findAll({
        status: 'pending',
        hostId: isHost ? req.user?.id : undefined
      });
      return res.json({ success: true, data: visits });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async approve(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const { reason } = req.body;

      const visit = await VisitRepository.findById(id);
      if (!visit) {
        return res.status(404).json({ success: false, message: 'Visit request not found' });
      }

      const updated = await VisitRepository.updateStatus(id, 'approved');

      // Generate visual QR
      const qrImage = await generateQRDataURL(visit.qr_token);

      // Notify Host and Security
      if (visit.host_id) {
        await NotificationRepository.create({
          user_id: visit.host_id,
          title: 'Visit Request Approved',
          message: `Visit for ${visit.visitor_name} has been approved. QR entry pass issued.`,
          type: 'success'
        });
      }

      await AuditLogRepository.log({
        user_id: req.user?.id,
        action: 'VISIT_APPROVED',
        entity_type: 'VISIT',
        entity_id: id,
        details: `Visit #${id} approved by ${req.user?.name}. Reason: ${reason || 'Approved'}`
      });

      return res.json({
        success: true,
        message: 'Visit approved successfully. QR code pass generated.',
        data: {
          ...updated,
          qr_image: qrImage
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async reject(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const { reason } = req.body;

      const visit = await VisitRepository.findById(id);
      if (!visit) {
        return res.status(404).json({ success: false, message: 'Visit request not found' });
      }

      const updated = await VisitRepository.updateStatus(id, 'rejected');

      if (visit.host_id) {
        await NotificationRepository.create({
          user_id: visit.host_id,
          title: 'Visit Request Rejected',
          message: `Visit for ${visit.visitor_name} was rejected. Reason: ${reason || 'Not specified'}`,
          type: 'alert'
        });
      }

      await AuditLogRepository.log({
        user_id: req.user?.id,
        action: 'VISIT_REJECTED',
        entity_type: 'VISIT',
        entity_id: id,
        details: `Visit #${id} rejected by ${req.user?.name}. Reason: ${reason || 'N/A'}`
      });

      return res.json({
        success: true,
        message: 'Visit request rejected',
        data: updated
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
