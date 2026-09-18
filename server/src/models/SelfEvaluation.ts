import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISelfEvaluation extends Document {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  assessmentId?: mongoose.Types.ObjectId;
  date: Date;
  learningGoals?: string;
  confidenceRating: number;
  perceivedProgress?: string;
  strengthsNotes?: string;
  challengesNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SelfEvaluationSchema: Schema<ISelfEvaluation> = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
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
    learningGoals: {
      type: String,
      trim: true
    },
    confidenceRating: {
      type: Number,
      required: [true, 'Confidence rating is required'],
      min: [1, 'Confidence rating must be at least 1'],
      max: [5, 'Confidence rating cannot exceed 5']
    },
    perceivedProgress: {
      type: String,
      trim: true
    },
    strengthsNotes: {
      type: String,
      trim: true
    },
    challengesNotes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const SelfEvaluation: Model<ISelfEvaluation> = mongoose.model<ISelfEvaluation>('SelfEvaluation', SelfEvaluationSchema);
