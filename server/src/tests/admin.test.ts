import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Progress } from '../models/Progress.js';
import { Assessment } from '../models/Assessment.js';
import { Program } from '../models/Program.js';
import { Activity } from '../models/Activity.js';
import { ProgramEnrollment } from '../models/ProgramEnrollment.js';
import { Task } from '../models/Task.js';

let mongoServer: MongoMemoryServer;
let adminToken: string;
let teacherToken: string;
let studentToken: string;
let adminId: string;
let studentDocId: string;
let programId: string;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test_jwt_secret_key_123';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Student.deleteMany({});
  await Progress.deleteMany({});
  await Assessment.deleteMany({});
  await Program.deleteMany({});
  await Activity.deleteMany({});
  await ProgramEnrollment.deleteMany({});
  await Task.deleteMany({});

  const admin = await User.create({ name: 'Admin User', email: 'admin@test.com', password: 'password123', role: 'ADMIN' });
  const teacher = await User.create({ name: 'Teacher User', email: 'teacher@test.com', password: 'password123', role: 'TEACHER_VOLUNTEER' });
  const studentUser = await User.create({ name: 'Student User', email: 'student@test.com', password: 'password123', role: 'STUDENT' });

  adminId = admin._id.toString();

  const secret = process.env.JWT_SECRET!;
  adminToken = jwt.sign({ id: adminId, role: 'ADMIN', email: admin.email }, secret);
  teacherToken = jwt.sign({ id: teacher._id.toString(), role: 'TEACHER_VOLUNTEER', email: teacher.email }, secret);
  studentToken = jwt.sign({ id: studentUser._id.toString(), role: 'STUDENT', email: studentUser.email }, secret);

  const studentDoc = await Student.create({
    studentCode: 'STU-ADM1',
    name: 'Alice AdminStudent',
    gender: 'FEMALE',
    dob: new Date(),
    centre: 'Delhi Centre',
    learningLevel: 'LEVEL_2',
    status: 'ACTIVE',
    userId: studentUser._id
  });

  studentDocId = studentDoc._id.toString();

  const program = await Program.create({
    title: 'Foundational Math',
    category: 'ACADEMIC',
    targetLevel: 'LEVEL_2',
    createdBy: admin._id
  });

  programId = program._id.toString();
});

describe('Member 4: Admin Dashboard, Analytics & Reports Integration Tests', () => {

  describe('1. Authorization Enforcement', () => {
    it('Unauthenticated request returns 401', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('STUDENT role request returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('TEACHER_VOLUNTEER role request returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${teacherToken}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('ADMIN role request is allowed (200)', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('2. Dashboard Metrics & Centre Scoping', () => {
    it('Computes aggregate counts, distributions, and dynamic overdue tasks', async () => {
      const pastDate = new Date(Date.now() - 86400000);
      await Task.create({
        title: 'Overdue Assignment',
        studentId: new mongoose.Types.ObjectId(studentDocId),
        assignedBy: new mongoose.Types.ObjectId(adminId),
        dueDate: pastDate,
        status: 'PENDING'
      });

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overview.totalStudents).toBe(1);
      expect(res.body.data.overview.totalPrograms).toBe(1);
      expect(res.body.data.overview.overdueTasks).toBe(1);
      expect(res.body.data.learningLevelDistribution.LEVEL_2).toBe(1);
    });

    it('Scopes student, assessment, and task metrics by centre while keeping programs organization-wide', async () => {
      const mStudentUser = await User.create({ name: 'Mumbai Student User', email: 'mumbai@test.com', password: 'password123', role: 'STUDENT' });
      const mStudent = await Student.create({
        studentCode: 'STU-MUM1',
        name: 'Bob Mumbai',
        gender: 'MALE',
        dob: new Date(),
        centre: 'Mumbai Centre',
        learningLevel: 'LEVEL_1',
        userId: mStudentUser._id
      });

      await Assessment.create({
        studentId: new mongoose.Types.ObjectId(studentDocId),
        evaluatorId: new mongoose.Types.ObjectId(adminId),
        title: 'Delhi Math',
        category: 'ACADEMIC',
        score: 80,
        status: 'COMPLETED',
        evaluatedLevel: 'LEVEL_2'
      });

      await Assessment.create({
        studentId: mStudent._id,
        evaluatorId: new mongoose.Types.ObjectId(adminId),
        title: 'Mumbai Math',
        category: 'ACADEMIC',
        score: 60,
        status: 'COMPLETED',
        evaluatedLevel: 'LEVEL_1'
      });

      await Task.create({
        title: 'Delhi Task',
        studentId: new mongoose.Types.ObjectId(studentDocId),
        assignedBy: new mongoose.Types.ObjectId(adminId),
        status: 'COMPLETED'
      });

      await Task.create({
        title: 'Mumbai Task',
        studentId: mStudent._id,
        assignedBy: new mongoose.Types.ObjectId(adminId),
        status: 'COMPLETED'
      });

      const res = await request(app)
        .get('/api/admin/dashboard?centre=Delhi%20Centre')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overview.totalStudents).toBe(1);
      expect(res.body.data.overview.totalAssessments).toBe(1);
      expect(res.body.data.overview.completedAssessments).toBe(1);
      expect(res.body.data.overview.totalTasks).toBe(1);
      expect(res.body.data.overview.completedTasks).toBe(1);
      expect(res.body.data.overview.totalPrograms).toBe(1);
    });

    it('Handles empty collections safely without returning NaN or null metrics', async () => {
      await Student.deleteMany({});
      await Program.deleteMany({});
      await Task.deleteMany({});

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overview.totalStudents).toBe(0);
      expect(res.body.data.overview.overdueTasks).toBe(0);
    });
  });

  describe('3. Student Analytics Filter Propagation & Academic Metrics', () => {
    it('Returns correct groupings and separate academic metrics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalStudents).toBe(1);
      expect(res.body.data.genderDistribution.FEMALE).toBe(1);
      expect(res.body.data.academicOverview.averageAssessmentScore).toBe(0);
      expect(res.body.data.academicOverview.averageProgressAcademicScore).toBe(0);
    });

    it('Propagates centre filter to Progress and Assessment cross-module metrics', async () => {
      const mStudentUser = await User.create({ name: 'Mumbai Student User 2', email: 'mumbai2@test.com', password: 'password123', role: 'STUDENT' });
      const mStudent = await Student.create({
        studentCode: 'STU-MUM2',
        name: 'Charlie Mumbai',
        gender: 'MALE',
        dob: new Date(),
        centre: 'Mumbai Centre',
        learningLevel: 'LEVEL_1',
        status: 'ACTIVE',
        userId: mStudentUser._id
      });

      await Progress.create({
        studentId: new mongoose.Types.ObjectId(studentDocId),
        recordedBy: new mongoose.Types.ObjectId(adminId),
        healthMetrics: { heightCm: 160, weightKg: 50 },
        socialEmotionalMetrics: { teamworkRating: 5, communicationRating: 4 },
        academicMetrics: { score: 100 }
      });

      await Progress.create({
        studentId: mStudent._id,
        recordedBy: new mongoose.Types.ObjectId(adminId),
        healthMetrics: { heightCm: 120, weightKg: 30 },
        socialEmotionalMetrics: { teamworkRating: 2, communicationRating: 2 },
        academicMetrics: { score: 40 }
      });

      await Assessment.create({
        studentId: new mongoose.Types.ObjectId(studentDocId),
        evaluatorId: new mongoose.Types.ObjectId(adminId),
        title: 'Delhi Assessment',
        category: 'ACADEMIC',
        score: 90,
        status: 'COMPLETED',
        evaluatedLevel: 'LEVEL_2'
      });

      await Assessment.create({
        studentId: mStudent._id,
        evaluatorId: new mongoose.Types.ObjectId(adminId),
        title: 'Mumbai Assessment',
        category: 'ACADEMIC',
        score: 50,
        status: 'COMPLETED',
        evaluatedLevel: 'LEVEL_1'
      });

      const res = await request(app)
        .get('/api/admin/analytics/students?centre=Delhi%20Centre')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalStudents).toBe(1);
      expect(res.body.data.healthOverview.averageHeightCm).toBe(160);
      expect(res.body.data.socialEmotionalOverview.averageTeamworkRating).toBe(5);
      expect(res.body.data.academicOverview.averageAssessmentScore).toBe(90);
      expect(res.body.data.academicOverview.averageProgressAcademicScore).toBe(100);
    });

    it('Propagates learningLevel and status filters to Progress and Assessment cross-module metrics', async () => {
      const s2User = await User.create({ name: 'Student 2 User', email: 'stu2@test.com', password: 'password123', role: 'STUDENT' });
      const s2Doc = await Student.create({
        studentCode: 'STU-ADM2',
        name: 'Dave Level1',
        gender: 'MALE',
        dob: new Date(),
        centre: 'Delhi Centre',
        learningLevel: 'LEVEL_1',
        status: 'ACTIVE',
        userId: s2User._id
      });

      await Progress.create({
        studentId: s2Doc._id,
        recordedBy: new mongoose.Types.ObjectId(adminId),
        academicMetrics: { score: 60 }
      });

      await Progress.create({
        studentId: new mongoose.Types.ObjectId(studentDocId),
        recordedBy: new mongoose.Types.ObjectId(adminId),
        academicMetrics: { score: 95 }
      });

      const res = await request(app)
        .get('/api/admin/analytics/students?learningLevel=LEVEL_1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalStudents).toBe(1);
      expect(res.body.data.academicOverview.averageProgressAcademicScore).toBe(60);
    });

    it('Preserves average score of exactly 0 without treating it as missing data', async () => {
      await Progress.create({
        studentId: new mongoose.Types.ObjectId(studentDocId),
        recordedBy: new mongoose.Types.ObjectId(adminId),
        academicMetrics: { score: 0 }
      });

      await Assessment.create({
        studentId: new mongoose.Types.ObjectId(studentDocId),
        evaluatorId: new mongoose.Types.ObjectId(adminId),
        title: 'Zero Score Assessment',
        category: 'ACADEMIC',
        score: 0,
        status: 'COMPLETED',
        evaluatedLevel: 'LEVEL_2'
      });

      const res = await request(app)
        .get('/api/admin/analytics/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.academicOverview.averageAssessmentScore).toBe(0);
      expect(res.body.data.academicOverview.averageProgressAcademicScore).toBe(0);
    });

    it('Rejects invalid learningLevel filter with 400', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/students?learningLevel=INVALID_LEVEL')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('Rejects invalid status filter with 400', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/students?status=INVALID_STATUS')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Program & Assessment Analytics', () => {
    it('Program analytics calculates category and task summaries', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/programs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalPrograms).toBe(1);
      expect(res.body.data.programCategoryDistribution.ACADEMIC).toBe(1);
    });

    it('Assessment analytics calculates category breakdown and average score', async () => {
      await Assessment.create({
        studentId: new mongoose.Types.ObjectId(studentDocId),
        evaluatorId: new mongoose.Types.ObjectId(adminId),
        title: 'Math Test 1',
        category: 'ACADEMIC',
        score: 90,
        status: 'COMPLETED',
        evaluatedLevel: 'LEVEL_2'
      });

      const res = await request(app)
        .get('/api/admin/analytics/assessments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalAssessments).toBe(1);
      expect(res.body.data.averageScore).toBe(90);
    });
  });

  describe('5. Reports & Pagination Validation', () => {
    it('Student report generates derived metrics without attendance fields', async () => {
      const res = await request(app)
        .get('/api/admin/reports/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reports.length).toBe(1);
      expect(res.body.data.reports[0].studentCode).toBe('STU-ADM1');
      expect(res.body.data.reports[0].attendancePercentage).toBeUndefined();
    });

    it('Program report generates enrollment and activity statistics', async () => {
      await Activity.create({
        programId: new mongoose.Types.ObjectId(programId),
        title: 'Intro Lesson',
        activityType: 'LESSON',
        scheduledDate: new Date(),
        status: 'COMPLETED',
        createdBy: new mongoose.Types.ObjectId(adminId)
      });

      const res = await request(app)
        .get('/api/admin/reports/programs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reports.length).toBe(1);
      expect(res.body.data.reports[0].completedActivities).toBe(1);
    });

    it('Rejects invalid pagination parameters (page=0) with 400', async () => {
      const res = await request(app)
        .get('/api/admin/reports/students?page=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

});
