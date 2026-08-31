import { Router } from 'express';
import { VisitController } from '../controllers/visitController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, VisitController.getAll);
router.get('/:id', authenticateToken, VisitController.getById);
router.post('/', VisitController.create);
router.put('/:id/status', authenticateToken, VisitController.updateStatus);

export default router;
