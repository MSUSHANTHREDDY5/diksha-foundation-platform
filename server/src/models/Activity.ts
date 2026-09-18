import mongoose, { Schema, Document, Model } from 'mongoose';

export type ActivityType = 'LESSON' | 'WORKSHOP' | 'PROJECT' | 'ASSESSMENT_PREP' | 'COMMUNITY';
export type ActivityStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  programId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  activityType: ActivityType;
  scheduledDate: Date;
  status: ActivityStatus;
  createdBy: mongoose.Types.ObjectId;
  outcomesSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema: Schema<IActivity> = new Schema(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: [true, 'Program ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    activityType: {
      type: String,
      enum: ['LESSON', 'WORKSHOP', 'PROJECT', 'ASSESSMENT_PREP', 'COMMUNITY'],
      required: [true, 'Activity type is required']
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true
    },
    status: {
      type: String,
      enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PLANNED',
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by User ID is required']
    },
    outcomesSummary: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Activity: Model<IActivity> = mongoose.model<IActivity>('Activity', ActivitySchema);
