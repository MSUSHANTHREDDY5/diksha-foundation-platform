import { Router } from 'express';
import * as studentController from './student.controller.js';
import * as progressController from '../progress/progress.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

// Apply authentication to all student & progress endpoints
router.use(authenticate);

// Student endpoints
router.post(
  '/',
  authorize('ADMIN', 'TEACHER_VOLUNTEER'),
  studentController.createStudent
);

router.get(
  '/',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  studentController.getStudents
);

router.get(
  '/:id',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  studentController.getStudentById
);

router.patch(
  '/:id',
  authorize('ADMIN', 'TEACHER_VOLUNTEER'),
  studentController.updateStudent
);

// Progress endpoints for a student
router.post(
  '/:id/progress',
  authorize('ADMIN', 'TEACHER_VOLUNTEER'),
  progressController.createProgress
);

router.get(
  '/:id/progress',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  progressController.getProgress
);

export default router;
