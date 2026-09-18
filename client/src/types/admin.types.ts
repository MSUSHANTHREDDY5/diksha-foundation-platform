export interface DashboardOverview {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  graduatedStudents: number;
  totalPrograms: number;
  activePrograms: number;
  totalAssessments: number;
  completedAssessments: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  learningLevelDistribution: Record<string, number>;
  centreDistribution: Array<{ centre: string; count: number }>;
}

export interface StudentAnalyticsData {
  totalStudents: number;
  genderDistribution: Record<string, number>;
  levelDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  healthOverview: {
    averageHeightCm: number;
    averageWeightKg: number;
  };
  socialEmotionalOverview: {
    averageTeamworkRating: number;
    averageCommunicationRating: number;
  };
  academicOverview: {
    averageAssessmentScore: number;
    averageProgressAcademicScore: number;
  };
}

export interface ProgramAnalyticsData {
  totalPrograms: number;
  programCategoryDistribution: Record<string, number>;
  enrollmentStatusSummary: Record<string, number>;
  activityStatusSummary: Record<string, number>;
  taskStatusSummary: Record<string, number>;
}

export interface AssessmentAnalyticsData {
  totalAssessments: number;
  statusBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  averageScore: number;
}

export interface StudentReportItem {
  studentId: string;
  studentCode: string;
  name: string;
  centre: string;
  learningLevel: string;
  status: string;
  assessmentCount: number;
  averageAssessmentScore: number;
  enrolledProgramCount: number;
  completedTaskCount: number;
}

export interface ProgramReportItem {
  programId: string;
  title: string;
  category: string;
  targetLevel: string;
  status: string;
  totalEnrolled: number;
  completedEnrollments: number;
  totalActivities: number;
  completedActivities: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
