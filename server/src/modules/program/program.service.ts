import mongoose from 'mongoose';
import { Program, IProgram, ProgramCategory, ProgramTargetLevel, ProgramStatus } from '../../models/Program.js';
import { Activity, IActivity, ActivityType, ActivityStatus } from '../../models/Activity.js';
import { ProgramEnrollment, IProgramEnrollment } from '../../models/ProgramEnrollment.js';
import { Student } from '../../models/Student.js';
import { AppError } from '../../middleware/error.middleware.js';
import { JwtPayloadUser } from '../../types/express.js';

export interface CreateProgramDTO {
  title: string;
  description?: string;
  category: ProgramCategory;
  targetLevel?: ProgramTargetLevel;
  startDate?: string | Date;
  endDate?: string | Date;
  expectedOutcomes?: string[];
}

export interface UpdateProgramDTO {
  title?: string;
  description?: string;
  category?: ProgramCategory;
  targetLevel?: ProgramTargetLevel;
  status?: ProgramStatus;
  startDate?: string | Date;
  endDate?: string | Date;
  expectedOutcomes?: string[];
}

export interface ProgramQueryFilters {
  category?: string;
  targetLevel?: string;
  status?: string;
  page?: string | number;
  limit?: string | number;
}

export interface CreateActivityDTO {
  title: string;
  description?: string;
  activityType: ActivityType;
  scheduledDate: string | Date;
  outcomesSummary?: string;
}

export interface UpdateActivityDTO {
  title?: string;
  description?: string;
  activityType?: ActivityType;
  scheduledDate?: string | Date;
  status?: ActivityStatus;
  outcomesSummary?: string;
}

export const createProgram = async (data: CreateProgramDTO, createdByUserId: string): Promise<IProgram> => {
  if (!data.title || !data.title.trim()) {
    const error: AppError = new Error('Program title is required');
    error.statusCode = 400;
    throw error;
  }

  if (!data.category) {
    const error: AppError = new Error('Program category is required');
    error.statusCode = 400;
    throw error;
  }

  const program = new Program({
    ...data,
    createdBy: new mongoose.Types.ObjectId(createdByUserId),
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate: data.endDate ? new Date(data.endDate) : undefined
  });

  await program.save();
  return program;
};

export const getPrograms = async (
  filters: ProgramQueryFilters
): Promise<{ programs: IProgram[]; pagination: { total: number; page: number; limit: number } }> => {
  const query: any = {};
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.targetLevel) {
    query.targetLevel = filters.targetLevel;
  }
  if (filters.status) {
    query.status = filters.status;
  }

  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
  const skip = (page - 1) * limit;

  const [programs, total] = await Promise.all([
    Program.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Program.countDocuments(query)
  ]);

  return {
    programs,
    pagination: {
      total,
      page,
      limit
    }
  };
};

export const getProgramById = async (id: string): Promise<IProgram> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error: AppError = new Error('Invalid program ID format');
    error.statusCode = 400;
    throw error;
  }

  const program = await Program.findById(id);
  if (!program) {
    const error: AppError = new Error('Program not found');
    error.statusCode = 404;
    throw error;
  }

  return program;
};

export const updateProgram = async (id: string, data: UpdateProgramDTO): Promise<IProgram> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error: AppError = new Error('Invalid program ID format');
    error.statusCode = 400;
    throw error;
  }

  const program = await Program.findById(id);
  if (!program) {
    const error: AppError = new Error('Program not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.startDate) {
    data.startDate = new Date(data.startDate);
  }
  if (data.endDate) {
    data.endDate = new Date(data.endDate);
  }

  Object.assign(program, data);
  await program.save();
  return program;
};

export const enrollStudentInProgram = async (
  programId: string,
  studentId: string,
  enrolledByUserId: string
): Promise<IProgramEnrollment> => {
  if (!mongoose.Types.ObjectId.isValid(programId) || !mongoose.Types.ObjectId.isValid(studentId)) {
    const error: AppError = new Error('Invalid program or student ID format');
    error.statusCode = 400;
    throw error;
  }

  const [program, student] = await Promise.all([Program.findById(programId), Student.findById(studentId)]);

  if (!program) {
    const error: AppError = new Error('Program not found');
    error.statusCode = 404;
    throw error;
  }

  if (!student) {
    const error: AppError = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  const existingEnrollment = await ProgramEnrollment.findOne({ programId, studentId });
  if (existingEnrollment) {
    const error: AppError = new Error('Student is already enrolled in this program');
    error.statusCode = 409;
    throw error;
  }

  const enrollment = new ProgramEnrollment({
    programId: program._id,
    studentId: student._id,
    enrolledBy: new mongoose.Types.ObjectId(enrolledByUserId)
  });

  await enrollment.save();
  return enrollment;
};

export const getProgramEnrollments = async (programId: string): Promise<IProgramEnrollment[]> => {
  if (!mongoose.Types.ObjectId.isValid(programId)) {
    const error: AppError = new Error('Invalid program ID format');
    error.statusCode = 400;
    throw error;
  }

  const program = await Program.findById(programId);
  if (!program) {
    const error: AppError = new Error('Program not found');
    error.statusCode = 404;
    throw error;
  }

  return ProgramEnrollment.find({ programId: program._id }).sort({ enrollmentDate: -1 });
};

export const getStudentPrograms = async (
  studentId: string,
  reqUser: JwtPayloadUser
): Promise<IProgramEnrollment[]> => {
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
      const error: AppError = new Error('Forbidden: Insufficient permissions to access this student programs');
      error.statusCode = 403;
      throw error;
    }
  }

  return ProgramEnrollment.find({ studentId: student._id }).sort({ enrollmentDate: -1 });
};

export const createActivity = async (
  programId: string,
  data: CreateActivityDTO,
  createdByUserId: string
): Promise<IActivity> => {
  if (!mongoose.Types.ObjectId.isValid(programId)) {
    const error: AppError = new Error('Invalid program ID format');
    error.statusCode = 400;
    throw error;
  }

  const program = await Program.findById(programId);
  if (!program) {
    const error: AppError = new Error('Program not found');
    error.statusCode = 404;
    throw error;
  }

  if (!data.title || !data.title.trim()) {
    const error: AppError = new Error('Activity title is required');
    error.statusCode = 400;
    throw error;
  }

  if (!data.activityType) {
    const error: AppError = new Error('Activity type is required');
    error.statusCode = 400;
    throw error;
  }

  if (!data.scheduledDate) {
    const error: AppError = new Error('Scheduled date is required');
    error.statusCode = 400;
    throw error;
  }

  const activity = new Activity({
    ...data,
    programId: program._id,
    createdBy: new mongoose.Types.ObjectId(createdByUserId),
    scheduledDate: new Date(data.scheduledDate)
  });

  await activity.save();
  return activity;
};

export const getProgramActivities = async (programId: string): Promise<IActivity[]> => {
  if (!mongoose.Types.ObjectId.isValid(programId)) {
    const error: AppError = new Error('Invalid program ID format');
    error.statusCode = 400;
    throw error;
  }

  const program = await Program.findById(programId);
  if (!program) {
    const error: AppError = new Error('Program not found');
    error.statusCode = 404;
    throw error;
  }

  return Activity.find({ programId: program._id }).sort({ scheduledDate: -1 });
};

export const updateActivity = async (activityId: string, data: UpdateActivityDTO): Promise<IActivity> => {
  if (!mongoose.Types.ObjectId.isValid(activityId)) {
    const error: AppError = new Error('Invalid activity ID format');
    error.statusCode = 400;
    throw error;
  }

  const activity = await Activity.findById(activityId);
  if (!activity) {
    const error: AppError = new Error('Activity not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.scheduledDate) {
    data.scheduledDate = new Date(data.scheduledDate);
  }

  Object.assign(activity, data);
  await activity.save();
  return activity;
};
