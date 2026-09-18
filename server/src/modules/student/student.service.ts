import mongoose from 'mongoose';
import { Student, IStudent, LearningLevel, StudentStatus, Gender, IGuardianInfo } from '../../models/Student.js';
import { Progress } from '../../models/Progress.js';
import { AppError } from '../../middleware/error.middleware.js';
import { JwtPayloadUser } from '../../types/express.js';

export interface CreateStudentDTO {
  studentCode: string;
  name: string;
  gender: Gender;
  dob: string | Date;
  centre: string;
  guardianInfo?: IGuardianInfo;
  learningLevel?: LearningLevel;
  userId?: string;
  currentProgramId?: string;
  status?: StudentStatus;
}

export interface UpdateStudentDTO {
  name?: string;
  gender?: Gender;
  dob?: string | Date;
  centre?: string;
  guardianInfo?: IGuardianInfo;
  learningLevel?: LearningLevel;
  currentProgramId?: string;
  status?: StudentStatus;
  userId?: string;
}

export interface StudentQueryFilters {
  centre?: string;
  learningLevel?: string;
  status?: string;
  search?: string;
  page?: string | number;
  limit?: string | number;
}

export const createStudent = async (data: CreateStudentDTO): Promise<IStudent> => {
  if (!data.studentCode) {
    const error: AppError = new Error('studentCode is required');
    error.statusCode = 400;
    throw error;
  }

  const existingStudent = await Student.findOne({ studentCode: data.studentCode.trim().toUpperCase() });
  if (existingStudent) {
    const error: AppError = new Error('Student with this studentCode already exists');
    error.statusCode = 409;
    throw error;
  }

  const student = new Student({
    ...data,
    studentCode: data.studentCode.trim().toUpperCase(),
    dob: new Date(data.dob)
  });

  await student.save();
  return student;
};

export const getStudents = async (
  filters: StudentQueryFilters,
  reqUser: JwtPayloadUser
): Promise<{ students: IStudent[]; pagination: { total: number; page: number; limit: number } }> => {
  const query: any = {};

  // Server-side ownership restriction for STUDENT role
  if (reqUser.role === 'STUDENT') {
    query.userId = new mongoose.Types.ObjectId(reqUser.id);
  } else {
    if (filters.centre) {
      query.centre = filters.centre;
    }
    if (filters.learningLevel) {
      query.learningLevel = filters.learningLevel;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { studentCode: { $regex: filters.search, $options: 'i' } }
      ];
    }
  }

  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Student.countDocuments(query)
  ]);

  return {
    students,
    pagination: {
      total,
      page,
      limit
    }
  };
};

export const getStudentById = async (id: string, reqUser: JwtPayloadUser): Promise<IStudent> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error: AppError = new Error('Invalid student ID format');
    error.statusCode = 400;
    throw error;
  }

  const student = await Student.findById(id);
  if (!student) {
    const error: AppError = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // Strict Server-side Ownership Verification for STUDENT role
  if (reqUser.role === 'STUDENT') {
    if (!student.userId || student.userId.toString() !== reqUser.id) {
      const error: AppError = new Error('Forbidden: Insufficient permissions to access this student profile');
      error.statusCode = 403;
      throw error;
    }
  }

  return student;
};

export const updateStudent = async (id: string, data: UpdateStudentDTO): Promise<IStudent> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error: AppError = new Error('Invalid student ID format');
    error.statusCode = 400;
    throw error;
  }

  const student = await Student.findById(id);
  if (!student) {
    const error: AppError = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.dob) {
    data.dob = new Date(data.dob);
  }

  Object.assign(student, data);
  await student.save();
  return student;
};

// Member 2 Integration Helper: Allows updating evaluated level from Assessment
export const updateLearningLevel = async (
  studentId: string,
  newLevel: LearningLevel,
  evaluatorUserId: string
): Promise<IStudent> => {
  const student = await Student.findById(studentId);
  if (!student) {
    const error: AppError = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  student.learningLevel = newLevel;
  await student.save();

  // Log level transition progress record
  await Progress.create({
    studentId: student._id,
    recordedBy: new mongoose.Types.ObjectId(evaluatorUserId),
    evaluatedLevel: newLevel,
    academicMetrics: {
      remarks: `Learning level updated to ${newLevel} via assessment evaluation`
    }
  });

  return student;
};
