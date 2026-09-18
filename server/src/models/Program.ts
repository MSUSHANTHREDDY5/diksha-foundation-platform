import mongoose, { Schema, Document, Model } from 'mongoose';
import { LearningLevel } from './Student.js';

export type ProgramCategory = 'ACADEMIC' | 'VOCATIONAL' | 'LIFE_SKILLS' | 'HOLISTIC';
export type ProgramTargetLevel = LearningLevel | 'ALL';
export type ProgramStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface IProgram extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: ProgramCategory;
  targetLevel: ProgramTargetLevel;
  status: ProgramStatus;
  createdBy: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  expectedOutcomes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema: Schema<IProgram> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Program title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      enum: ['ACADEMIC', 'VOCATIONAL', 'LIFE_SKILLS', 'HOLISTIC'],
      required: [true, 'Program category is required']
    },
    targetLevel: {
      type: String,
      enum: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'ADVANCED', 'ALL'],
      default: 'ALL'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by User ID is required']
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    expectedOutcomes: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Program: Model<IProgram> = mongoose.model<IProgram>('Program', ProgramSchema);
