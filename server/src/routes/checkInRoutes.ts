import { Router } from 'express';
import { CheckInController } from '../controllers/checkInController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.post('/:id/check-in', authenticateToken, authorizeRoles('admin', 'security'), CheckInController.checkIn);
router.post('/:id/check-out', authenticateToken, authorizeRoles('admin', 'security'), CheckInController.checkOut);

export default router;
