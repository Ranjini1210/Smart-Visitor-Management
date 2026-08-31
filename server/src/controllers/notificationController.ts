import { Response } from 'express';
import { NotificationRepository } from '../repositories/notificationRepository';
import { AuthRequest } from '../middleware/auth';

export class NotificationController {
  static async getUserNotifications(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const notifications = await NotificationRepository.findByUserId(req.user.id);
      return res.json({ success: true, data: notifications });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async markRead(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      await NotificationRepository.markAsRead(id);
      return res.json({ success: true, message: 'Notification marked as read' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
