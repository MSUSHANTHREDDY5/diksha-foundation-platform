import { Router } from 'express';
import * as programController from './program.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

// Program Routes
router.post(
  '/programs',
  authorize('ADMIN', 'TEACHER_VOLUNTEER'),
  programController.createProgram
);

router.get(
  '/programs',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  programController.getPrograms
);

router.get(
  '/programs/:id',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  programController.getProgramById
);

router.patch(
  '/programs/:id',
  authorize('ADMIN', 'TEACHER_VOLUNTEER'),
  programController.updateProgram
);

// Program Enrollment Routes
router.post(
  '/programs/:id/enrollments',
  authorize('ADMIN', 'TEACHER_VOLUNTEER'),
  programController.enrollStudent
);

router.get(
  '/programs/:id/enrollments',
  authorize('ADMIN', 'TEACHER_VOLUNTEER'),
  programController.getProgramEnrollments
);

router.get(
  '/students/:id/programs',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  programController.getStudentPrograms
);

// Activity Routes
router.post(
  '/programs/:id/activities',
  authorize('ADMIN', 'TEACHER_VOLUNTEER'),
  programController.createActivity
);

router.get(
  '/programs/:id/activities',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  programController.getProgramActivities
);

router.patch(
  '/activities/:id',
  authorize('ADMIN', 'TEACHER_VOLUNTEER'),
  programController.updateActivity
);

export default router;
