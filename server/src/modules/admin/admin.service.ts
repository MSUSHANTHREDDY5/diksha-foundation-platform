import mongoose from 'mongoose';
import { Student } from '../../models/Student.js';
import { Progress } from '../../models/Progress.js';
import { Assessment } from '../../models/Assessment.js';
import { Program } from '../../models/Program.js';
import { Activity } from '../../models/Activity.js';
import { ProgramEnrollment } from '../../models/ProgramEnrollment.js';
import { Task } from '../../models/Task.js';
import { AppError } from '../../middleware/error.middleware.js';

export interface StudentAnalyticsQuery {
  centre?: string;
  learningLevel?: string;
  status?: string;
}

export interface ProgramAnalyticsQuery {
  category?: string;
  status?: string;
}

export interface AssessmentAnalyticsQuery {
  category?: string;
}

export interface ReportPaginationQuery {
  page?: string | number;
  limit?: string | number;
}

const VALID_LEARNING_LEVELS = ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'ADVANCED'];
const VALID_STUDENT_STATUSES = ['ACTIVE', 'INACTIVE', 'GRADUATED'];
const VALID_PROGRAM_CATEGORIES = ['ACADEMIC', 'VOCATIONAL', 'LIFE_SKILLS', 'HOLISTIC'];
const VALID_PROGRAM_STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];
const VALID_ASSESSMENT_CATEGORIES = ['ACADEMIC', 'VOCATIONAL', 'BEHAVIORAL', 'COMPREHENSIVE'];

const parsePagination = (query: ReportPaginationQuery): { page: number; limit: number; skip: number } => {
  const rawPage = query.page !== undefined ? Number(query.page) : 1;
  const rawLimit = query.limit !== undefined ? Number(query.limit) : 10;

  if (isNaN(rawPage) || rawPage < 1 || !Number.isInteger(rawPage)) {
    const error: AppError = new Error('Page must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  if (isNaN(rawLimit) || rawLimit < 1 || !Number.isInteger(rawLimit)) {
    const error: AppError = new Error('Limit must be a positive integer');
    error.statusCode = 400;
    throw error;
  }

  const page = rawPage;
  const limit = Math.min(100, rawLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getDashboard = async (centreFilter?: string) => {
  const studentQuery: any = {};
  if (centreFilter && centreFilter.trim()) {
    studentQuery.centre = centreFilter.trim();
  }

  const now = new Date();

  let assessmentQuery: any = {};
  let taskQuery: any = {};

  if (studentQuery.centre) {
    const centreStudents = await Student.find(studentQuery).select('_id');
    const centreStudentIds = centreStudents.map((s) => s._id);
    assessmentQuery = { studentId: { $in: centreStudentIds } };
    taskQuery = { studentId: { $in: centreStudentIds } };
  }

  const [
    totalStudents,
    activeStudents,
    inactiveStudents,
    graduatedStudents,
    totalPrograms,
    activePrograms,
    totalAssessments,
    completedAssessments,
    totalTasks,
    completedTasks,
    overdueTasks,
    levelAgg,
    centreAgg
  ] = await Promise.all([
    Student.countDocuments(studentQuery),
    Student.countDocuments({ ...studentQuery, status: 'ACTIVE' }),
    Student.countDocuments({ ...studentQuery, status: 'INACTIVE' }),
    Student.countDocuments({ ...studentQuery, status: 'GRADUATED' }),
    Program.countDocuments({}),
    Program.countDocuments({ status: 'ACTIVE' }),
    Assessment.countDocuments(assessmentQuery),
    Assessment.countDocuments({ ...assessmentQuery, status: 'COMPLETED' }),
    Task.countDocuments(taskQuery),
    Task.countDocuments({ ...taskQuery, status: 'COMPLETED' }),
    Task.countDocuments({ ...taskQuery, status: { $ne: 'COMPLETED' }, dueDate: { $lt: now } }),
    Student.aggregate([
      { $match: studentQuery },
      { $group: { _id: '$learningLevel', count: { $sum: 1 } } }
    ]),
    Student.aggregate([
      { $group: { _id: '$centre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  const learningLevelDistribution: Record<string, number> = {
    LEVEL_1: 0,
    LEVEL_2: 0,
    LEVEL_3: 0,
    ADVANCED: 0
  };

  levelAgg.forEach((item) => {
    if (item._id && learningLevelDistribution[item._id] !== undefined) {
      learningLevelDistribution[item._id] = item.count;
    }
  });

  const centreDistribution = centreAgg.map((item) => ({
    centre: item._id || 'Unknown',
    count: item.count
  }));

  return {
    overview: {
      totalStudents,
      activeStudents,
      inactiveStudents,
      graduatedStudents,
      totalPrograms,
      activePrograms,
      totalAssessments,
      completedAssessments,
      totalTasks,
      completedTasks,
      overdueTasks
    },
    learningLevelDistribution,
    centreDistribution
  };
};

export const getStudentAnalytics = async (queryFilters: StudentAnalyticsQuery) => {
  const query: any = {};

  if (queryFilters.centre && queryFilters.centre.trim()) {
    query.centre = queryFilters.centre.trim();
  }

  if (queryFilters.learningLevel) {
    if (!VALID_LEARNING_LEVELS.includes(queryFilters.learningLevel)) {
      const error: AppError = new Error(`Invalid learningLevel filter: ${queryFilters.learningLevel}`);
      error.statusCode = 400;
      throw error;
    }
    query.learningLevel = queryFilters.learningLevel;
  }

  if (queryFilters.status) {
    if (!VALID_STUDENT_STATUSES.includes(queryFilters.status)) {
      const error: AppError = new Error(`Invalid status filter: ${queryFilters.status}`);
      error.statusCode = 400;
      throw error;
    }
    query.status = queryFilters.status;
  }

  const matchingStudents = await Student.find(query).select('_id');
  const matchingStudentIds = matchingStudents.map((s) => s._id);

  const [
    totalStudents,
    genderAgg,
    levelAgg,
    statusAgg,
    progressAgg,
    assessmentAgg
  ] = await Promise.all([
    Student.countDocuments(query),
    Student.aggregate([
      { $match: query },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]),
    Student.aggregate([
      { $match: query },
      { $group: { _id: '$learningLevel', count: { $sum: 1 } } }
    ]),
    Student.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Progress.aggregate([
      { $match: { studentId: { $in: matchingStudentIds } } },
      {
        $group: {
          _id: null,
          avgHeightCm: { $avg: '$healthMetrics.heightCm' },
          avgWeightKg: { $avg: '$healthMetrics.weightKg' },
          avgTeamworkRating: { $avg: '$socialEmotionalMetrics.teamworkRating' },
          avgCommunicationRating: { $avg: '$socialEmotionalMetrics.communicationRating' },
          avgAcademicScore: { $avg: '$academicMetrics.score' }
        }
      }
    ]),
    Assessment.aggregate([
      { $match: { studentId: { $in: matchingStudentIds }, status: 'COMPLETED' } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ])
  ]);

  const genderDistribution: Record<string, number> = { MALE: 0, FEMALE: 0, OTHER: 0 };
  genderAgg.forEach((item) => {
    if (item._id && genderDistribution[item._id] !== undefined) {
      genderDistribution[item._id] = item.count;
    }
  });

  const levelDistribution: Record<string, number> = { LEVEL_1: 0, LEVEL_2: 0, LEVEL_3: 0, ADVANCED: 0 };
  levelAgg.forEach((item) => {
    if (item._id && levelDistribution[item._id] !== undefined) {
      levelDistribution[item._id] = item.count;
    }
  });

  const statusDistribution: Record<string, number> = { ACTIVE: 0, INACTIVE: 0, GRADUATED: 0 };
  statusAgg.forEach((item) => {
    if (item._id && statusDistribution[item._id] !== undefined) {
      statusDistribution[item._id] = item.count;
    }
  });

  const pStats = progressAgg[0] || {};
  const aStats = assessmentAgg[0] || {};

  const rawAssessmentAvg = aStats.avgScore;
  const averageAssessmentScore = (rawAssessmentAvg !== undefined && rawAssessmentAvg !== null)
    ? Math.round(rawAssessmentAvg * 10) / 10
    : 0;

  const rawProgressAvg = pStats.avgAcademicScore;
  const averageProgressAcademicScore = (rawProgressAvg !== undefined && rawProgressAvg !== null)
    ? Math.round(rawProgressAvg * 10) / 10
    : 0;

  const averageHeightCm = (pStats.avgHeightCm !== undefined && pStats.avgHeightCm !== null)
    ? Math.round(pStats.avgHeightCm * 10) / 10
    : 0;

  const averageWeightKg = (pStats.avgWeightKg !== undefined && pStats.avgWeightKg !== null)
    ? Math.round(pStats.avgWeightKg * 10) / 10
    : 0;

  const averageTeamworkRating = (pStats.avgTeamworkRating !== undefined && pStats.avgTeamworkRating !== null)
    ? Math.round(pStats.avgTeamworkRating * 10) / 10
    : 0;

  const averageCommunicationRating = (pStats.avgCommunicationRating !== undefined && pStats.avgCommunicationRating !== null)
    ? Math.round(pStats.avgCommunicationRating * 10) / 10
    : 0;

  return {
    totalStudents,
    genderDistribution,
    levelDistribution,
    statusDistribution,
    healthOverview: {
      averageHeightCm,
      averageWeightKg
    },
    socialEmotionalOverview: {
      averageTeamworkRating,
      averageCommunicationRating
    },
    academicOverview: {
      averageAssessmentScore,
      averageProgressAcademicScore
    }
  };
};

export const getProgramAnalytics = async (queryFilters: ProgramAnalyticsQuery) => {
  const programQuery: any = {};

  if (queryFilters.category) {
    if (!VALID_PROGRAM_CATEGORIES.includes(queryFilters.category)) {
      const error: AppError = new Error(`Invalid category filter: ${queryFilters.category}`);
      error.statusCode = 400;
      throw error;
    }
    programQuery.category = queryFilters.category;
  }

  if (queryFilters.status) {
    if (!VALID_PROGRAM_STATUSES.includes(queryFilters.status)) {
      const error: AppError = new Error(`Invalid status filter: ${queryFilters.status}`);
      error.statusCode = 400;
      throw error;
    }
    programQuery.status = queryFilters.status;
  }

  const now = new Date();

  const [
    totalPrograms,
    categoryAgg,
    enrollmentAgg,
    activityAgg,
    taskAgg,
    overdueTaskCount
  ] = await Promise.all([
    Program.countDocuments(programQuery),
    Program.aggregate([
      { $match: programQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]),
    ProgramEnrollment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Activity.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Task.countDocuments({ status: { $ne: 'COMPLETED' }, dueDate: { $lt: now } })
  ]);

  const programCategoryDistribution: Record<string, number> = {
    ACADEMIC: 0,
    VOCATIONAL: 0,
    LIFE_SKILLS: 0,
    HOLISTIC: 0
  };
  categoryAgg.forEach((item) => {
    if (item._id && programCategoryDistribution[item._id] !== undefined) {
      programCategoryDistribution[item._id] = item.count;
    }
  });

  const enrollmentStatusSummary: Record<string, number> = {
    ENROLLED: 0,
    COMPLETED: 0,
    DROPPED: 0
  };
  enrollmentAgg.forEach((item) => {
    if (item._id && enrollmentStatusSummary[item._id] !== undefined) {
      enrollmentStatusSummary[item._id] = item.count;
    }
  });

  const activityStatusSummary: Record<string, number> = {
    PLANNED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    CANCELLED: 0
  };
  activityAgg.forEach((item) => {
    if (item._id && activityStatusSummary[item._id] !== undefined) {
      activityStatusSummary[item._id] = item.count;
    }
  });

  const taskStatusSummary: Record<string, number> = {
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
    OVERDUE: overdueTaskCount
  };
  taskAgg.forEach((item) => {
    if (item._id && taskStatusSummary[item._id] !== undefined) {
      taskStatusSummary[item._id] = item.count;
    }
  });

  return {
    totalPrograms,
    programCategoryDistribution,
    enrollmentStatusSummary,
    activityStatusSummary,
    taskStatusSummary
  };
};

export const getAssessmentAnalytics = async (queryFilters: AssessmentAnalyticsQuery) => {
  const query: any = {};

  if (queryFilters.category) {
    if (!VALID_ASSESSMENT_CATEGORIES.includes(queryFilters.category)) {
      const error: AppError = new Error(`Invalid category filter: ${queryFilters.category}`);
      error.statusCode = 400;
      throw error;
    }
    query.category = queryFilters.category;
  }

  const [
    totalAssessments,
    statusAgg,
    categoryAgg,
    avgScoreAgg
  ] = await Promise.all([
    Assessment.countDocuments(query),
    Assessment.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Assessment.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]),
    Assessment.aggregate([
      { $match: { ...query, status: 'COMPLETED' } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ])
  ]);

  const statusBreakdown: Record<string, number> = { DRAFT: 0, COMPLETED: 0 };
  statusAgg.forEach((item) => {
    if (item._id && statusBreakdown[item._id] !== undefined) {
      statusBreakdown[item._id] = item.count;
    }
  });

  const categoryBreakdown: Record<string, number> = {
    ACADEMIC: 0,
    VOCATIONAL: 0,
    BEHAVIORAL: 0,
    COMPREHENSIVE: 0
  };
  categoryAgg.forEach((item) => {
    if (item._id && categoryBreakdown[item._id] !== undefined) {
      categoryBreakdown[item._id] = item.count;
    }
  });

  const rawAvg = avgScoreAgg[0]?.avgScore;
  const averageScore = rawAvg !== undefined && rawAvg !== null ? Math.round(rawAvg * 10) / 10 : 0;

  return {
    totalAssessments,
    statusBreakdown,
    categoryBreakdown,
    averageScore
  };
};

export const getStudentReports = async (queryFilters: StudentAnalyticsQuery & ReportPaginationQuery) => {
  const query: any = {};

  if (queryFilters.centre && queryFilters.centre.trim()) {
    query.centre = queryFilters.centre.trim();
  }

  if (queryFilters.learningLevel) {
    if (!VALID_LEARNING_LEVELS.includes(queryFilters.learningLevel)) {
      const error: AppError = new Error(`Invalid learningLevel filter: ${queryFilters.learningLevel}`);
      error.statusCode = 400;
      throw error;
    }
    query.learningLevel = queryFilters.learningLevel;
  }

  if (queryFilters.status) {
    if (!VALID_STUDENT_STATUSES.includes(queryFilters.status)) {
      const error: AppError = new Error(`Invalid status filter: ${queryFilters.status}`);
      error.statusCode = 400;
      throw error;
    }
    query.status = queryFilters.status;
  }

  const { page, limit, skip } = parsePagination(queryFilters);

  const [students, total] = await Promise.all([
    Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Student.countDocuments(query)
  ]);

  const studentIds = students.map((s) => s._id);

  const [assessmentStats, enrollmentStats, taskStats] = await Promise.all([
    Assessment.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      {
        $group: {
          _id: '$studentId',
          totalAssessments: { $sum: 1 },
          completedScores: {
            $push: {
              $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$score', null]
            }
          }
        }
      }
    ]),
    ProgramEnrollment.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $group: { _id: '$studentId', totalEnrolled: { $sum: 1 } } }
    ]),
    Task.aggregate([
      { $match: { studentId: { $in: studentIds }, status: 'COMPLETED' } },
      { $group: { _id: '$studentId', completedTasks: { $sum: 1 } } }
    ])
  ]);

  const assessmentMap = new Map<string, { total: number; avgScore: number }>();
  assessmentStats.forEach((item) => {
    const validScores = (item.completedScores || []).filter((s: any) => s !== null && s !== undefined);
    const avg = validScores.length > 0 ? validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length : 0;
    assessmentMap.set(item._id.toString(), {
      total: item.totalAssessments,
      avgScore: Math.round(avg * 10) / 10
    });
  });

  const enrollmentMap = new Map<string, number>();
  enrollmentStats.forEach((item) => {
    enrollmentMap.set(item._id.toString(), item.totalEnrolled);
  });

  const taskMap = new Map<string, number>();
  taskStats.forEach((item) => {
    taskMap.set(item._id.toString(), item.completedTasks);
  });

  const reports = students.map((s) => {
    const sId = s._id.toString();
    const aData = assessmentMap.get(sId) || { total: 0, avgScore: 0 };
    return {
      studentId: s._id,
      studentCode: s.studentCode,
      name: s.name,
      centre: s.centre,
      learningLevel: s.learningLevel,
      status: s.status,
      assessmentCount: aData.total,
      averageAssessmentScore: aData.avgScore,
      enrolledProgramCount: enrollmentMap.get(sId) || 0,
      completedTaskCount: taskMap.get(sId) || 0
    };
  });

  return {
    reports,
    pagination: {
      total,
      page,
      limit
    }
  };
};

export const getProgramReports = async (queryFilters: ProgramAnalyticsQuery & ReportPaginationQuery) => {
  const query: any = {};

  if (queryFilters.category) {
    if (!VALID_PROGRAM_CATEGORIES.includes(queryFilters.category)) {
      const error: AppError = new Error(`Invalid category filter: ${queryFilters.category}`);
      error.statusCode = 400;
      throw error;
    }
    query.category = queryFilters.category;
  }

  if (queryFilters.status) {
    if (!VALID_PROGRAM_STATUSES.includes(queryFilters.status)) {
      const error: AppError = new Error(`Invalid status filter: ${queryFilters.status}`);
      error.statusCode = 400;
      throw error;
    }
    query.status = queryFilters.status;
  }

  const { page, limit, skip } = parsePagination(queryFilters);

  const [programs, total] = await Promise.all([
    Program.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Program.countDocuments(query)
  ]);

  const programIds = programs.map((p) => p._id);

  const [enrollmentStats, activityStats] = await Promise.all([
    ProgramEnrollment.aggregate([
      { $match: { programId: { $in: programIds } } },
      {
        $group: {
          _id: '$programId',
          totalEnrolled: { $sum: 1 },
          completedEnrollments: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
          }
        }
      }
    ]),
    Activity.aggregate([
      { $match: { programId: { $in: programIds } } },
      {
        $group: {
          _id: '$programId',
          totalActivities: { $sum: 1 },
          completedActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
          }
        }
      }
    ])
  ]);

  const enrollmentMap = new Map<string, { total: number; completed: number }>();
  enrollmentStats.forEach((item) => {
    enrollmentMap.set(item._id.toString(), {
      total: item.totalEnrolled,
      completed: item.completedEnrollments
    });
  });

  const activityMap = new Map<string, { total: number; completed: number }>();
  activityStats.forEach((item) => {
    activityMap.set(item._id.toString(), {
      total: item.totalActivities,
      completed: item.completedActivities
    });
  });

  const reports = programs.map((p) => {
    const pId = p._id.toString();
    const eData = enrollmentMap.get(pId) || { total: 0, completed: 0 };
    const actData = activityMap.get(pId) || { total: 0, completed: 0 };

    return {
      programId: p._id,
      title: p.title,
      category: p.category,
      targetLevel: p.targetLevel,
      status: p.status,
      totalEnrolled: eData.total,
      completedEnrollments: eData.completed,
      totalActivities: actData.total,
      completedActivities: actData.completed
    };
  });

  return {
    reports,
    pagination: {
      total,
      page,
      limit
    }
  };
};
