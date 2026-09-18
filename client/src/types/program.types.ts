export type ProgramCategory = 'ACADEMIC' | 'VOCATIONAL' | 'LIFE_SKILLS' | 'HOLISTIC';
export type ProgramTargetLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'ADVANCED' | 'ALL';
export type ProgramStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type ActivityType = 'LESSON' | 'WORKSHOP' | 'PROJECT' | 'ASSESSMENT_PREP' | 'COMMUNITY';
export type ActivityStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type EnrollmentStatus = 'ENROLLED' | 'COMPLETED' | 'DROPPED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface ProgramData {
  _id: string;
  title: string;
  description?: string;
  category: ProgramCategory;
  targetLevel: ProgramTargetLevel;
  status: ProgramStatus;
  createdBy: string;
  startDate?: string;
  endDate?: string;
  expectedOutcomes?: string[];
  createdAt: string;
}

export interface ActivityData {
  _id: string;
  programId: string;
  title: string;
  description?: string;
  activityType: ActivityType;
  scheduledDate: string;
  status: ActivityStatus;
  createdBy: string;
  outcomesSummary?: string;
  createdAt: string;
}

export interface EnrollmentData {
  _id: string;
  programId: string;
  studentId: string;
  enrolledBy: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  completionDate?: string;
  createdAt: string;
}

export interface TaskCommentData {
  _id: string;
  authorId: string;
  authorRole: 'ADMIN' | 'TEACHER_VOLUNTEER' | 'STUDENT';
  message: string;
  createdAt: string;
}

export interface TaskData {
  _id: string;
  title: string;
  description?: string;
  studentId: string;
  programId?: string;
  activityId?: string;
  assignedBy: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string;
  outcomeNotes?: string;
  comments: TaskCommentData[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
