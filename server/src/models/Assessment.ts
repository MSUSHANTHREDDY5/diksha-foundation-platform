import mongoose, { Schema, Document, Model } from 'mongoose';
import { LearningLevel } from './Student.js';

export type AssessmentCategory = 'ACADEMIC' | 'VOCATIONAL' | 'BEHAVIORAL' | 'COMPREHENSIVE';
export type AssessmentStatus = 'DRAFT' | 'COMPLETED';

export interface IAssessment extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  evaluatorId: mongoose.Types.ObjectId;
  title: string;
  category: AssessmentCategory;
  score: number;
  maxScore: number;
  evaluatedLevel?: LearningLevel;
  status: AssessmentStatus;
  feedback?: string;
  assessmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema: Schema<IAssessment> = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true
    },
    evaluatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Evaluator User ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['ACADEMIC', 'VOCATIONAL', 'BEHAVIORAL', 'COMPREHENSIVE'],
      default: 'ACADEMIC'
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100']
    },
    maxScore: {
      type: Number,
      default: 100
    },
    evaluatedLevel: {
      type: String,
      enum: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'ADVANCED'],
      required: function (this: IAssessment): boolean {
        return this.status === 'COMPLETED';
      }
    },
    status: {
      type: String,
      enum: ['DRAFT', 'COMPLETED'],
      default: 'DRAFT',
      index: true
    },
    feedback: {
      type: String,
      trim: true
    },
    assessmentDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const Assessment: Model<IAssessment> = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
