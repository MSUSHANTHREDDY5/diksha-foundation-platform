import mongoose from 'mongoose';
import { Progress, IProgress, IAcademicMetrics, IHealthMetrics, ISocialEmotionalMetrics, IPracticalProjectMetrics } from '../../models/Progress.js';
import { Student, LearningLevel } from '../../models/Student.js';
import { AppError } from '../../middleware/error.middleware.js';
import { JwtPayloadUser } from '../../types/express.js';

export interface CreateProgressDTO {
  academicMetrics?: IAcademicMetrics;
  healthMetrics?: IHealthMetrics;
  socialEmotionalMetrics?: ISocialEmotionalMetrics;
  practicalProjectMetrics?: IPracticalProjectMetrics;
  evaluatedLevel?: LearningLevel;
  date?: string | Date;
}

export interface ProgressQueryFilters {
  startDate?: string;
  endDate?: string;
  limit?: string | number;
}

export const createProgress = async (
  studentId: string,
  data: CreateProgressDTO,
  recordedByUserId: string
): Promise<IProgress> => {
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

  const progress = new Progress({
    ...data,
    studentId: student._id,
    recordedBy: new mongoose.Types.ObjectId(recordedByUserId),
    date: data.date ? new Date(data.date) : new Date()
  });

  await progress.save();

  // Optionally update student's evaluated learning level if passed in progress log
  if (data.evaluatedLevel && data.evaluatedLevel !== student.learningLevel) {
    student.learningLevel = data.evaluatedLevel;
    await student.save();
  }

  return progress;
};

export const getProgressByStudentId = async (
  studentId: string,
  filters: ProgressQueryFilters,
  reqUser: JwtPayloadUser
): Promise<{ progressHistory: IProgress[]; summary: { latestLevel: string; totalRecords: number } }> => {
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
      const error: AppError = new Error('Forbidden: Insufficient permissions to access this student progress log');
      error.statusCode = 403;
      throw error;
    }
  }

  const query: any = { studentId: student._id };

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate);
    }
  }

  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));

  const [progressHistory, totalRecords] = await Promise.all([
    Progress.find(query).sort({ date: -1 }).limit(limit),
    Progress.countDocuments({ studentId: student._id })
  ]);

  return {
    progressHistory,
    summary: {
      latestLevel: student.learningLevel,
      totalRecords
    }
  };
};
