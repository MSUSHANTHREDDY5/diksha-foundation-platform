import mongoose from 'mongoose';
import { SelfEvaluation, ISelfEvaluation } from '../../models/SelfEvaluation.js';
import { PeerReview, IPeerReview } from '../../models/PeerReview.js';
import { Student } from '../../models/Student.js';
import { AppError } from '../../middleware/error.middleware.js';
import { JwtPayloadUser } from '../../types/express.js';

export interface CreateSelfEvaluationDTO {
  assessmentId?: string;
  learningGoals?: string;
  confidenceRating: number;
  perceivedProgress?: string;
  strengthsNotes?: string;
  challengesNotes?: string;
  date?: string | Date;
}

export interface CreatePeerReviewDTO {
  assessmentId?: string;
  collaborationScore: number;
  helpfulnessScore: number;
  positiveFeedback: string;
  constructiveFeedback?: string;
  date?: string | Date;
}

export const createSelfEvaluation = async (
  studentId: string,
  data: CreateSelfEvaluationDTO,
  reqUser: JwtPayloadUser
): Promise<ISelfEvaluation> => {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    const error: AppError = new Error('Invalid student ID format');
    error.statusCode = 400;
    throw error;
  }

  const student = await Student.findById(studentId);
  if (!student) {
    const error: AppError = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // Server-side ownership verification for STUDENT role
  if (reqUser.role === 'STUDENT') {
    if (!student.userId || student.userId.toString() !== reqUser.id) {
      const error: AppError = new Error('Forbidden: You can only submit self-evaluations for your own profile');
      error.statusCode = 403;
      throw error;
    }
  }

  const selfEvaluation = new SelfEvaluation({
    ...data,
    studentId: student._id,
    date: data.date ? new Date(data.date) : new Date()
  });

  await selfEvaluation.save();
  return selfEvaluation;
};

export const getSelfEvaluationsByStudentId = async (
  studentId: string,
  reqUser: JwtPayloadUser
): Promise<ISelfEvaluation[]> => {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    const error: AppError = new Error('Invalid student ID format');
    error.statusCode = 400;
    throw error;
  }

  const student = await Student.findById(studentId);
  if (!student) {
    const error: AppError = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // Server-side ownership verification for STUDENT role
  if (reqUser.role === 'STUDENT') {
    if (!student.userId || student.userId.toString() !== reqUser.id) {
      const error: AppError = new Error('Forbidden: Insufficient permissions to access these self-evaluations');
      error.statusCode = 403;
      throw error;
    }
  }

  return SelfEvaluation.find({ studentId: student._id }).sort({ date: -1 });
};

export const createPeerReview = async (
  targetStudentId: string,
  data: CreatePeerReviewDTO,
  reqUser: JwtPayloadUser
): Promise<IPeerReview> => {
  if (!mongoose.Types.ObjectId.isValid(targetStudentId)) {
    const error: AppError = new Error('Invalid student ID format');
    error.statusCode = 400;
    throw error;
  }

  const targetStudent = await Student.findById(targetStudentId);
  if (!targetStudent) {
    const error: AppError = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // Fixed Contract: Reject self-peer-review with HTTP 400
  if (targetStudent.userId && targetStudent.userId.toString() === reqUser.id) {
    const error: AppError = new Error('Self peer-review is prohibited');
    error.statusCode = 400;
    throw error;
  }

  const peerReview = new PeerReview({
    ...data,
    studentId: targetStudent._id,
    reviewerId: new mongoose.Types.ObjectId(reqUser.id),
    date: data.date ? new Date(data.date) : new Date()
  });

  await peerReview.save();
  return peerReview;
};

export const getPeerReviewsByStudentId = async (
  targetStudentId: string,
  reqUser: JwtPayloadUser
): Promise<IPeerReview[]> => {
  if (!mongoose.Types.ObjectId.isValid(targetStudentId)) {
    const error: AppError = new Error('Invalid student ID format');
    error.statusCode = 400;
    throw error;
  }

  const targetStudent = await Student.findById(targetStudentId);
  if (!targetStudent) {
    const error: AppError = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // Server-side ownership check for STUDENT role
  if (reqUser.role === 'STUDENT') {
    if (!targetStudent.userId || targetStudent.userId.toString() !== reqUser.id) {
      const error: AppError = new Error('Forbidden: Insufficient permissions to access these peer-reviews');
      error.statusCode = 403;
      throw error;
    }
  }

  return PeerReview.find({ studentId: targetStudent._id }).sort({ date: -1 });
};
