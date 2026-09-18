import mongoose, { Schema, Document, Model } from 'mongoose';

export type LearningLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'ADVANCED';
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface IGuardianInfo {
  name?: string;
  phone?: string;
  relation?: string;
}

export interface IStudent extends Document {
  _id: mongoose.Types.ObjectId;
  studentCode: string;
  name: string;
  gender: Gender;
  dob: Date;
  centre: string;
  guardianInfo?: IGuardianInfo;
  learningLevel: LearningLevel;
  userId?: mongoose.Types.ObjectId;
  currentProgramId?: mongoose.Types.ObjectId;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema<IStudent> = new Schema(
  {
    studentCode: {
      type: String,
      required: [true, 'Student code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: [true, 'Gender is required']
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    centre: {
      type: String,
      required: [true, 'Learning centre is required'],
      trim: true,
      index: true
    },
    guardianInfo: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true }
    },
    learningLevel: {
      type: String,
      enum: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'ADVANCED'],
      default: 'LEVEL_1',
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    currentProgramId: {
      type: Schema.Types.ObjectId
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'GRADUATED'],
      default: 'ACTIVE',
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Student: Model<IStudent> = mongoose.model<IStudent>('Student', StudentSchema);
