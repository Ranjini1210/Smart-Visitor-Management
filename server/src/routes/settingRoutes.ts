import { Router } from 'express';
import { SettingController } from '../controllers/settingController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.get('/departments', SettingController.getDepartments);
router.post('/departments', authenticateToken, authorizeRoles('admin'), SettingController.createDepartment);
router.get('/hosts', SettingController.getHosts);
router.get('/audit-logs', authenticateToken, authorizeRoles('admin'), SettingController.getAuditLogs);

export default router;
