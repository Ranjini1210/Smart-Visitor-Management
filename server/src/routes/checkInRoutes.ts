import { Router } from 'express';
import { CheckInController } from '../controllers/checkInController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// Search & lookup endpoint (can be accessed by authenticated users or kiosk)
router.get('/lookup', authenticateToken, CheckInController.lookup);

// Quick check-in & check-out by email, phone, or token
router.post('/instant-check-in', authenticateToken, CheckInController.checkInByQuery);
router.post('/instant-check-out', authenticateToken, CheckInController.checkOutByQuery);

// Direct ID check-in / check-out
router.post('/:id/check-in', authenticateToken, CheckInController.checkIn);
router.post('/:id/check-out', authenticateToken, CheckInController.checkOut);

export default router;

