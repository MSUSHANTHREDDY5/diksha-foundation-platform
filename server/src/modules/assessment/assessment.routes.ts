import { Router } from 'express';
import * as assessmentController from './assessment.controller.js';
import * as evaluationController from '../evaluation/evaluation.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

// Assessment Routes
router.post(
  '/students/:id/assessments',
  authorize('ADMIN', 'TEACHER_VOLUNTEER'),
  assessmentController.createAssessment
);

router.get(
  '/students/:id/assessments',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  assessmentController.getStudentAssessments
);

router.get(
  '/assessments/:id',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  assessmentController.getAssessmentById
);

router.patch(
  '/assessments/:id',
  authorize('ADMIN', 'TEACHER_VOLUNTEER'),
  assessmentController.updateAssessment
);

// Self-Evaluation Routes
router.post(
  '/students/:id/self-evaluations',
  authorize('STUDENT', 'ADMIN', 'TEACHER_VOLUNTEER'),
  evaluationController.createSelfEvaluation
);

router.get(
  '/students/:id/self-evaluations',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  evaluationController.getSelfEvaluations
);

// Peer-Review Routes
router.post(
  '/students/:id/peer-reviews',
  authorize('STUDENT', 'TEACHER_VOLUNTEER', 'ADMIN'),
  evaluationController.createPeerReview
);

router.get(
  '/students/:id/peer-reviews',
  authorize('ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'),
  evaluationController.getPeerReviews
);

export default router;
