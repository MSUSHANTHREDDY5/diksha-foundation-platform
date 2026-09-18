import mongoose, { Schema, Document, Model } from 'mongoose';

export type EnrollmentStatus = 'ENROLLED' | 'COMPLETED' | 'DROPPED';

export interface IProgramEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  programId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  enrolledBy: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  status: EnrollmentStatus;
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramEnrollmentSchema: Schema<IProgramEnrollment> = new Schema(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: [true, 'Program ID is required'],
      index: true
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
      index: true
    },
    enrolledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Enrolled by User ID is required']
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['ENROLLED', 'COMPLETED', 'DROPPED'],
      default: 'ENROLLED',
      index: true
    },
    completionDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound Unique Index: Prevents duplicate enrollment of same student in same program
ProgramEnrollmentSchema.index({ programId: 1, studentId: 1 }, { unique: true });

export const ProgramEnrollment: Model<IProgramEnrollment> = mongoose.model<IProgramEnrollment>(
  'ProgramEnrollment',
  ProgramEnrollmentSchema
);
