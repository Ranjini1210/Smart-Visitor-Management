import { Router } from 'express';
import { VisitController } from '../controllers/visitController';
import { CheckInController } from '../controllers/checkInController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, VisitController.getAll);
router.get('/:id', authenticateToken, VisitController.getById);
router.post('/', VisitController.create);
router.put('/:id/status', authenticateToken, VisitController.updateStatus);
router.post('/:id/check-in', authenticateToken, authorizeRoles('admin', 'security'), CheckInController.checkIn);
router.post('/:id/check-out', authenticateToken, authorizeRoles('admin', 'security'), CheckInController.checkOut);

export default router;
