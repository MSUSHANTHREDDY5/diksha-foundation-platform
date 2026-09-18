import mongoose from 'mongoose';
import { Assessment, IAssessment, AssessmentCategory, AssessmentStatus } from '../../models/Assessment.js';
import { Student, LearningLevel } from '../../models/Student.js';
import { updateLearningLevel } from '../student/student.service.js';
import { AppError } from '../../middleware/error.middleware.js';
import { JwtPayloadUser } from '../../types/express.js';

export interface CreateAssessmentDTO {
  title: string;
  category?: AssessmentCategory;
  score: number;
  maxScore?: number;
  evaluatedLevel?: LearningLevel;
  status?: AssessmentStatus;
  feedback?: string;
  assessmentDate?: string | Date;
}

export interface UpdateAssessmentDTO {
  title?: string;
  category?: AssessmentCategory;
  score?: number;
  maxScore?: number;
  evaluatedLevel?: LearningLevel;
  status?: AssessmentStatus;
  feedback?: string;
}

export interface AssessmentQueryFilters {
  category?: string;
  status?: string;
  page?: string | number;
  limit?: string | number;
}

const VALID_LEVELS: LearningLevel[] = ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'ADVANCED'];

export const createAssessment = async (
  studentId: string,
  data: CreateAssessmentDTO,
  evaluatorUserId: string
): Promise<{ assessment: IAssessment; levelUpdated: boolean }> => {
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

  const status: AssessmentStatus = data.status || 'COMPLETED';

  if (status === 'COMPLETED') {
    if (!data.evaluatedLevel || !VALID_LEVELS.includes(data.evaluatedLevel)) {
      const error: AppError = new Error('evaluatedLevel is required and must be valid when assessment status is COMPLETED');
      error.statusCode = 400;
      throw error;
    }
  }

  const assessment = new Assessment({
    ...data,
    status,
    studentId: student._id,
    evaluatorId: new mongoose.Types.ObjectId(evaluatorUserId),
    assessmentDate: data.assessmentDate ? new Date(data.assessmentDate) : new Date()
  });

  await assessment.save();

  let levelUpdated = false;
  if (status === 'COMPLETED' && data.evaluatedLevel) {
    // Coordinated multi-step update via Member 1 integration helper
    await updateLearningLevel(student._id.toString(), data.evaluatedLevel, evaluatorUserId);
    levelUpdated = true;
  }

  return { assessment, levelUpdated };
};

export const updateAssessment = async (
  assessmentId: string,
  data: UpdateAssessmentDTO,
  evaluatorUserId: string
): Promise<{ assessment: IAssessment; levelUpdated: boolean }> => {
  if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
    const error: AppError = new Error('Invalid assessment ID format');
    error.statusCode = 400;
    throw error;
  }

  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) {
    const error: AppError = new Error('Assessment not found');
    error.statusCode = 404;
    throw error;
  }

  const prevStatus = assessment.status;
  const newStatus = data.status || prevStatus;
  const targetLevel = data.evaluatedLevel || assessment.evaluatedLevel;

  let levelUpdated = false;

  // Transitioning from DRAFT to COMPLETED
  if (prevStatus !== 'COMPLETED' && newStatus === 'COMPLETED') {
    if (!targetLevel || !VALID_LEVELS.includes(targetLevel)) {
      const error: AppError = new Error('evaluatedLevel is required to complete an assessment');
      error.statusCode = 400;
      throw error;
    }

    Object.assign(assessment, data);
    await assessment.save();

    // Invoke Member 1 helper exactly once upon DRAFT -> COMPLETED transition
    await updateLearningLevel(assessment.studentId.toString(), targetLevel, evaluatorUserId);
    levelUpdated = true;
  } else {
    // Updating fields for already COMPLETED or DRAFT assessment (idempotent; no duplicate progress log)
    Object.assign(assessment, data);
    await assessment.save();
  }

  return { assessment, levelUpdated };
};

export const getAssessmentsByStudentId = async (
  studentId: string,
  filters: AssessmentQueryFilters,
  reqUser: JwtPayloadUser
): Promise<{ assessments: IAssessment[]; pagination: { total: number; page: number; limit: number } }> => {
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

  // Strict Server-Side Ownership Enforcement for STUDENT role
  if (reqUser.role === 'STUDENT') {
    if (!student.userId || student.userId.toString() !== reqUser.id) {
      const error: AppError = new Error('Forbidden: Insufficient permissions to access this student assessments');
      error.statusCode = 403;
      throw error;
    }
  }

  const query: any = { studentId: student._id };
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.status) {
    query.status = filters.status;
  }

  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
  const skip = (page - 1) * limit;

  const [assessments, total] = await Promise.all([
    Assessment.find(query).sort({ assessmentDate: -1 }).skip(skip).limit(limit),
    Assessment.countDocuments(query)
  ]);

  return {
    assessments,
    pagination: {
      total,
      page,
      limit
    }
  };
};

export const getAssessmentById = async (assessmentId: string, reqUser: JwtPayloadUser): Promise<IAssessment> => {
  if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
    const error: AppError = new Error('Invalid assessment ID format');
    error.statusCode = 400;
    throw error;
  }

  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) {
    const error: AppError = new Error('Assessment not found');
    error.statusCode = 404;
    throw error;
  }

  // Server-side ownership check for STUDENT role
  if (reqUser.role === 'STUDENT') {
    const student = await Student.findById(assessment.studentId);
    if (!student || !student.userId || student.userId.toString() !== reqUser.id) {
      const error: AppError = new Error('Forbidden: Insufficient permissions to access this assessment record');
      error.statusCode = 403;
      throw error;
    }
  }

  return assessment;
};
