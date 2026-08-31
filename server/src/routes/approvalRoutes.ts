import { Router } from 'express';
import { ApprovalController } from '../controllers/approvalController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/pending', authenticateToken, authorizeRoles('admin', 'host'), ApprovalController.getPending);
router.post('/:id/approve', authenticateToken, authorizeRoles('admin', 'host'), ApprovalController.approve);
router.post('/:id/reject', authenticateToken, authorizeRoles('admin', 'host'), ApprovalController.reject);

export default router;
