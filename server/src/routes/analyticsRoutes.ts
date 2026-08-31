import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/overview', authenticateToken, AnalyticsController.getOverview);
router.get('/traffic', authenticateToken, AnalyticsController.getTraffic);
router.get('/purposes', authenticateToken, AnalyticsController.getPurposes);
router.get('/peak-hours', authenticateToken, AnalyticsController.getPeakHours);

export default router;
