import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/profiles', AuthController.getProfiles);
router.post('/login', AuthController.login);
router.post('/pin-login', AuthController.loginWithPin);
router.post('/visitor-login', AuthController.visitorLogin);
router.get('/me', authenticateToken, AuthController.me);
router.post('/logout', authenticateToken, AuthController.logout);

export default router;
