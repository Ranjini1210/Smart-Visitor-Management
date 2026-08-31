import { Router } from 'express';
import { VisitorController } from '../controllers/visitorController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, VisitorController.getAll);
router.get('/:id', authenticateToken, VisitorController.getById);
router.post('/', VisitorController.create);
router.put('/:id', authenticateToken, VisitorController.update);

export default router;
