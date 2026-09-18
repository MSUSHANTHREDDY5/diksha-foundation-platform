import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPeerReview extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  assessmentId?: mongoose.Types.ObjectId;
  date: Date;
  collaborationScore: number;
  helpfulnessScore: number;
  positiveFeedback: string;
  constructiveFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PeerReviewSchema: Schema<IPeerReview> = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Target Student ID is required'],
      index: true
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer User ID is required'],
      index: true
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment'
    },
    date: {
      type: Date,
      default: Date.now
    },
    collaborationScore: {
      type: Number,
      required: [true, 'Collaboration score is required'],
      min: [1, 'Collaboration score must be at least 1'],
      max: [5, 'Collaboration score cannot exceed 5']
    },
    helpfulnessScore: {
      type: Number,
      required: [true, 'Helpfulness score is required'],
      min: [1, 'Helpfulness score must be at least 1'],
      max: [5, 'Helpfulness score cannot exceed 5']
    },
    positiveFeedback: {
      type: String,
      required: [true, 'Positive feedback is required'],
      trim: true
    },
    constructiveFeedback: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const PeerReview: Model<IPeerReview> = mongoose.model<IPeerReview>('PeerReview', PeerReviewSchema);
