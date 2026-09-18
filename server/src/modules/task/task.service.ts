import mongoose from 'mongoose';
import { Task, ITask, ITaskComment, TaskPriority, TaskStatus } from '../../models/Task.js';
import { Student } from '../../models/Student.js';
import { Program } from '../../models/Program.js';
import { Activity } from '../../models/Activity.js';
import { AppError } from '../../middleware/error.middleware.js';
import { JwtPayloadUser } from '../../types/express.js';

export interface CreateTaskDTO {
  title: string;
  description?: string;
  studentId: string;
  programId?: string;
  activityId?: string;
  dueDate?: string | Date;
  priority?: TaskPriority;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  studentId?: string;
  programId?: string;
  activityId?: string;
  assignedBy?: string;
  dueDate?: string | Date;
  priority?: TaskPriority;
  status?: TaskStatus;
  outcomeNotes?: string;
}

export interface TaskQueryFilters {
  studentId?: string;
  programId?: string;
  status?: string;
  page?: string | number;
  limit?: string | number;
}

export const createTask = async (data: CreateTaskDTO, assignedByUserId: string): Promise<ITask> => {
  if (!data.title || !data.title.trim()) {
    const error: AppError = new Error('Task title is required');
    error.statusCode = 400;
    throw error;
  }

  if (!data.studentId || !mongoose.Types.ObjectId.isValid(data.studentId)) {
    const error: AppError = new Error('Valid student ID is required');
    error.statusCode = 400;
    throw error;
  }

  const student = await Student.findById(data.studentId);
  if (!student) {
    const error: AppError = new Error('Target student not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.programId) {
    if (!mongoose.Types.ObjectId.isValid(data.programId)) {
      const error: AppError = new Error('Invalid program ID format');
      error.statusCode = 400;
      throw error;
    }
    const program = await Program.findById(data.programId);
    if (!program) {
      const error: AppError = new Error('Referenced program not found');
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.activityId) {
    if (!mongoose.Types.ObjectId.isValid(data.activityId)) {
      const error: AppError = new Error('Invalid activity ID format');
      error.statusCode = 400;
      throw error;
    }
    const activity = await Activity.findById(data.activityId);
    if (!activity) {
      const error: AppError = new Error('Referenced activity not found');
      error.statusCode = 404;
      throw error;
    }
  }

  const task = new Task({
    ...data,
    studentId: student._id,
    programId: data.programId ? new mongoose.Types.ObjectId(data.programId) : undefined,
    activityId: data.activityId ? new mongoose.Types.ObjectId(data.activityId) : undefined,
    assignedBy: new mongoose.Types.ObjectId(assignedByUserId),
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    comments: []
  });

  await task.save();
  return task;
};

export const getTasks = async (
  filters: TaskQueryFilters,
  reqUser: JwtPayloadUser
): Promise<{ tasks: ITask[]; pagination: { total: number; page: number; limit: number } }> => {
  const query: any = {};

  if (reqUser.role === 'STUDENT') {
    // Look up Student document associated with reqUser.id
    const student = await Student.findOne({ userId: new mongoose.Types.ObjectId(reqUser.id) });
    if (!student) {
      return { tasks: [], pagination: { total: 0, page: 1, limit: 10 } };
    }

    if (filters.studentId && filters.studentId !== student._id.toString()) {
      const error: AppError = new Error('Forbidden: You can only view tasks assigned to your own profile');
      error.statusCode = 403;
      throw error;
    }

    query.studentId = student._id;
  } else {
    if (filters.studentId) {
      if (!mongoose.Types.ObjectId.isValid(filters.studentId)) {
        const error: AppError = new Error('Invalid student ID format');
        error.statusCode = 400;
        throw error;
      }
      query.studentId = new mongoose.Types.ObjectId(filters.studentId);
    }
  }

  if (filters.programId) {
    if (!mongoose.Types.ObjectId.isValid(filters.programId)) {
      const error: AppError = new Error('Invalid program ID format');
      error.statusCode = 400;
      throw error;
    }
    query.programId = new mongoose.Types.ObjectId(filters.programId);
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Task.countDocuments(query)
  ]);

  return {
    tasks,
    pagination: {
      total,
      page,
      limit
    }
  };
};

export const getTaskById = async (taskId: string, reqUser: JwtPayloadUser): Promise<ITask> => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    const error: AppError = new Error('Invalid task ID format');
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    const error: AppError = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  if (reqUser.role === 'STUDENT') {
    const student = await Student.findById(task.studentId);
    if (!student || !student.userId || student.userId.toString() !== reqUser.id) {
      const error: AppError = new Error('Forbidden: You can only view your own assigned tasks');
      error.statusCode = 403;
      throw error;
    }
  }

  return task;
};

export const updateTask = async (taskId: string, data: UpdateTaskDTO, reqUser: JwtPayloadUser): Promise<ITask> => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    const error: AppError = new Error('Invalid task ID format');
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    const error: AppError = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  if (reqUser.role === 'STUDENT') {
    // Verify ownership
    const student = await Student.findById(task.studentId);
    if (!student || !student.userId || student.userId.toString() !== reqUser.id) {
      const error: AppError = new Error('Forbidden: You can only update tasks assigned to your own profile');
      error.statusCode = 403;
      throw error;
    }

    // Reject attempt by STUDENT to modify administrative task fields
    const restrictedFields = ['title', 'description', 'studentId', 'programId', 'activityId', 'assignedBy', 'dueDate', 'priority'];
    const attemptedRestricted = restrictedFields.filter((field) => (data as any)[field] !== undefined);

    if (attemptedRestricted.length > 0) {
      const error: AppError = new Error('Forbidden: Students can only update task status and outcomeNotes');
      error.statusCode = 403;
      throw error;
    }
  }

  // Handle status transitions and completedAt lifecycle
  if (data.status) {
    if (data.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      task.completedAt = new Date();
    } else if (data.status !== 'COMPLETED' && task.status === 'COMPLETED') {
      task.completedAt = undefined;
    }
    task.status = data.status;
  }

  if (data.outcomeNotes !== undefined) {
    task.outcomeNotes = data.outcomeNotes;
  }

  if (reqUser.role !== 'STUDENT') {
    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
  }

  await task.save();
  return task;
};

export const addTaskComment = async (
  taskId: string,
  message: string,
  reqUser: JwtPayloadUser
): Promise<{ comment: ITaskComment; task: ITask }> => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    const error: AppError = new Error('Invalid task ID format');
    error.statusCode = 400;
    throw error;
  }

  if (!message || !message.trim()) {
    const error: AppError = new Error('Comment message cannot be empty');
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    const error: AppError = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  if (reqUser.role === 'STUDENT') {
    const student = await Student.findById(task.studentId);
    if (!student || !student.userId || student.userId.toString() !== reqUser.id) {
      const error: AppError = new Error('Forbidden: You can only comment on your own tasks');
      error.statusCode = 403;
      throw error;
    }
  }

  const newComment = {
    _id: new mongoose.Types.ObjectId(),
    authorId: new mongoose.Types.ObjectId(reqUser.id),
    authorRole: reqUser.role as 'ADMIN' | 'TEACHER_VOLUNTEER' | 'STUDENT',
    message: message.trim(),
    createdAt: new Date()
  };

  task.comments.push(newComment as ITaskComment);
  await task.save();

  return { comment: newComment as ITaskComment, task };
};
