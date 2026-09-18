import mongoose, { Schema, Document, Model } from 'mongoose';
import { LearningLevel } from './Student.js';

export interface IAcademicMetrics {
  subject?: string;
  score?: number;
  grade?: string;
  remarks?: string;
}

export interface IHealthMetrics {
  heightCm?: number;
  weightKg?: number;
  attendancePercentage?: number;
  healthNotes?: string;
}

export interface ISocialEmotionalMetrics {
  teamworkRating?: number;
  communicationRating?: number;
  behavioralNotes?: string;
}

export interface IPracticalProjectMetrics {
  projectName?: string;
  completionStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  projectScore?: number;
  feedback?: string;
}

export interface IProgress extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  date: Date;
  academicMetrics?: IAcademicMetrics;
  healthMetrics?: IHealthMetrics;
  socialEmotionalMetrics?: ISocialEmotionalMetrics;
  practicalProjectMetrics?: IPracticalProjectMetrics;
  evaluatedLevel?: LearningLevel;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema: Schema<IProgress> = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recorder User ID is required']
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    academicMetrics: {
      subject: { type: String, trim: true },
      score: { type: Number, min: 0, max: 100 },
      grade: { type: String, trim: true },
      remarks: { type: String, trim: true }
    },
    healthMetrics: {
      heightCm: { type: Number, min: 0 },
      weightKg: { type: Number, min: 0 },
      attendancePercentage: { type: Number, min: 0, max: 100 },
      healthNotes: { type: String, trim: true }
    },
    socialEmotionalMetrics: {
      teamworkRating: { type: Number, min: 1, max: 5 },
      communicationRating: { type: Number, min: 1, max: 5 },
      behavioralNotes: { type: String, trim: true }
    },
    practicalProjectMetrics: {
      projectName: { type: String, trim: true },
      completionStatus: {
        type: String,
        enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']
      },
      projectScore: { type: Number, min: 1, max: 5 },
      feedback: { type: String, trim: true }
    },
    evaluatedLevel: {
      type: String,
      enum: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'ADVANCED']
    }
  },
  {
    timestamps: true
  }
);

export const Progress: Model<IProgress> = mongoose.model<IProgress>('Progress', ProgressSchema);
