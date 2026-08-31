import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, NotificationController.getUserNotifications);
router.put('/:id/read', authenticateToken, NotificationController.markRead);

export default router;
