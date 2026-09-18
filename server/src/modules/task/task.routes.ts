import { Router } from 'express';
import * as taskController from './task.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.post(
  '/tasks',
  authorize('ADMIN', 'TEACHER_VOLUNTEER'),
  taskController.createTask
);

router.get(
  '/tasks',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  taskController.getTasks
);

router.get(
  '/tasks/:id',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  taskController.getTaskById
);

router.patch(
  '/tasks/:id',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  taskController.updateTask
);

router.post(
  '/tasks/:id/comments',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  taskController.addTaskComment
);

export default router;
