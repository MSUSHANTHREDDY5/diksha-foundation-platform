import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from './User.js';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface ITaskComment {
  _id: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  authorRole: UserRole;
  message: string;
  createdAt: Date;
}

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  studentId: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  activityId?: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: Date;
  outcomeNotes?: string;
  comments: ITaskComment[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskCommentSchema = new Schema({
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author ID is required']
  },
  authorRole: {
    type: String,
    enum: ['ADMIN', 'TEACHER_VOLUNTEER', 'STUDENT'],
    required: [true, 'Comment author role is required']
  },
  message: {
    type: String,
    required: [true, 'Comment message is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TaskSchema: Schema<ITask> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      index: true
    },
    activityId: {
      type: Schema.Types.ObjectId,
      ref: 'Activity',
      index: true
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned by User ID is required'],
      index: true
    },
    dueDate: {
      type: Date,
      index: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PENDING',
      index: true
    },
    completedAt: {
      type: Date
    },
    outcomeNotes: {
      type: String,
      trim: true
    },
    comments: [TaskCommentSchema]
  },
  {
    timestamps: true
  }
);

export const Task: Model<ITask> = mongoose.model<ITask>('Task', TaskSchema);
