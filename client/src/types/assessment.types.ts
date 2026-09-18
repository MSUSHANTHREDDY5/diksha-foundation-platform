export type AssessmentCategory = 'ACADEMIC' | 'VOCATIONAL' | 'BEHAVIORAL' | 'COMPREHENSIVE';
export type AssessmentStatus = 'DRAFT' | 'COMPLETED';
export type LearningLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'ADVANCED';

export interface AssessmentData {
  _id: string;
  studentId: string;
  evaluatorId: string;
  title: string;
  category: AssessmentCategory;
  score: number;
  maxScore: number;
  evaluatedLevel?: LearningLevel;
  status: AssessmentStatus;
  feedback?: string;
  assessmentDate: string;
  createdAt: string;
}

export interface SelfEvaluationData {
  _id: string;
  studentId: string;
  assessmentId?: string;
  date: string;
  learningGoals?: string;
  confidenceRating: number;
  perceivedProgress?: string;
  strengthsNotes?: string;
  challengesNotes?: string;
}

export interface PeerReviewData {
  _id: string;
  studentId: string;
  reviewerId: string;
  assessmentId?: string;
  date: string;
  collaborationScore: number;
  helpfulnessScore: number;
  positiveFeedback: string;
  constructiveFeedback?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
