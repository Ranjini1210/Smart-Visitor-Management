import { Request, Response } from 'express';
import { VisitRepository } from '../repositories/visitRepository';
import { generateQRDataURL } from '../utils/qr';
import { AuditLogRepository } from '../repositories/auditLogRepository';
import { AuthRequest } from '../middleware/auth';

export class QRController {
  static async getQR(req: Request, res: Response) {
    try {
      const visitId = parseInt(req.params.id, 10);
      const visit = await VisitRepository.findById(visitId);
      if (!visit) {
        return res.status(404).json({ success: false, message: 'Visit not found' });
      }

      const qrImage = await generateQRDataURL(visit.qr_token);
      return res.json({
        success: true,
        data: {
          visit_id: visit.id,
          token: visit.qr_token,
          qr_image: qrImage
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async verifyQR(req: AuthRequest, res: Response) {
    try {
      let { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: 'QR token is required' });
      }

      // Handle JSON payload if token is scanned as JSON string
      if (typeof token === 'string' && token.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(token);
          if (parsed.token) token = parsed.token;
        } catch {
          // ignore
        }
      }

      const visit = await VisitRepository.findByQRToken(token.trim());
      if (!visit) {
        return res.status(404).json({
          success: false,
          message: 'Invalid or unrecognized QR token'
        });
      }

      const qrImage = await generateQRDataURL(visit.qr_token);

      await AuditLogRepository.log({
        user_id: req.user?.id,
        action: 'QR_SCANNED',
        entity_type: 'VISIT',
        entity_id: visit.id,
        details: `QR token ${token} scanned by ${req.user?.name || 'Security Guard'}`
      });

      return res.json({
        success: true,
        message: 'QR verified successfully',
        data: {
          ...visit,
          qr_image: qrImage
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
