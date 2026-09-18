import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/analytics/students', adminController.getStudentAnalytics);
router.get('/analytics/programs', adminController.getProgramAnalytics);
router.get('/analytics/assessments', adminController.getAssessmentAnalytics);
router.get('/reports/students', adminController.getStudentReports);
router.get('/reports/programs', adminController.getProgramReports);

export default router;
