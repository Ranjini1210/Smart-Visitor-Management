import { Router } from 'express';
import { QRController } from '../controllers/qrController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/visits/:id/qr', authenticateToken, QRController.getQR);
router.post('/verify', authenticateToken, QRController.verifyQR);

export default router;
