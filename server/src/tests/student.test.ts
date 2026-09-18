import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Progress } from '../models/Progress.js';
import { updateLearningLevel } from '../modules/student/student.service.js';

let mongoServer: MongoMemoryServer;
let adminToken: string;
let teacherToken: string;
let studentUser1Token: string;
let studentUser2Token: string;
let studentUser1Id: string;
let studentUser2Id: string;

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

  // Seed test users
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'ADMIN'
  });

  const teacher = await User.create({
    name: 'Teacher User',
    email: 'teacher@test.com',
    password: 'password123',
    role: 'TEACHER_VOLUNTEER'
  });

  const studentUser1 = await User.create({
    name: 'Student User One',
    email: 'student1@test.com',
    password: 'password123',
    role: 'STUDENT'
  });

  const studentUser2 = await User.create({
    name: 'Student User Two',
    email: 'student2@test.com',
    password: 'password123',
    role: 'STUDENT'
  });

  studentUser1Id = studentUser1._id.toString();
  studentUser2Id = studentUser2._id.toString();

  const secret = process.env.JWT_SECRET!;
  adminToken = jwt.sign({ id: admin._id.toString(), role: 'ADMIN', email: admin.email }, secret);
  teacherToken = jwt.sign({ id: teacher._id.toString(), role: 'TEACHER_VOLUNTEER', email: teacher.email }, secret);
  studentUser1Token = jwt.sign({ id: studentUser1Id, role: 'STUDENT', email: studentUser1.email }, secret);
  studentUser2Token = jwt.sign({ id: studentUser2Id, role: 'STUDENT', email: studentUser2.email }, secret);
});

describe('Member 1: Student Management & Progress Integration Tests', () => {

  it('1. Create Student Success - POST /api/students', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        studentCode: 'STU-101',
        name: 'Rahul Kumar',
        gender: 'MALE',
        dob: '2015-06-15',
        centre: 'Delhi Centre',
        guardianInfo: { name: 'Suresh Kumar', phone: '9876543210', relation: 'Father' },
        learningLevel: 'LEVEL_1'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.student).toBeDefined();
    expect(res.body.data.student.studentCode).toBe('STU-101');
    expect(res.body.data.student.learningLevel).toBe('LEVEL_1');
  });

  it('2. Reject Missing studentCode - POST /api/students returns 400', async () => {
    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        name: 'No Code Student',
        gender: 'FEMALE',
        dob: '2016-01-01',
        centre: 'Delhi Centre'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('3. Reject Duplicate studentCode - POST /api/students returns 409', async () => {
    await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        studentCode: 'STU-DUP',
        name: 'Student Original',
        gender: 'MALE',
        dob: '2015-01-01',
        centre: 'Delhi Centre'
      });

    const res = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        studentCode: 'STU-DUP',
        name: 'Student Copy',
        gender: 'FEMALE',
        dob: '2015-02-02',
        centre: 'Mumbai Centre'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('4. List Students with Filters - GET /api/students', async () => {
    await Student.create([
      { studentCode: 'S1', name: 'Alice', gender: 'FEMALE', dob: new Date(), centre: 'Centre A', learningLevel: 'LEVEL_1' },
      { studentCode: 'S2', name: 'Bob', gender: 'MALE', dob: new Date(), centre: 'Centre B', learningLevel: 'LEVEL_2' }
    ]);

    const res = await request(app)
      .get('/api/students?centre=Centre A')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.students.length).toBe(1);
    expect(res.body.data.students[0].name).toBe('Alice');
  });

  it('5. Get Student by ID - Teacher access returns 200', async () => {
    const student = await Student.create({
      studentCode: 'S3',
      name: 'Charlie',
      gender: 'MALE',
      dob: new Date(),
      centre: 'Centre A'
    });

    const res = await request(app)
      .get(`/api/students/${student._id}`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.student.name).toBe('Charlie');
  });

  it('6. Server-Side Student Ownership Protection - Student CANNOT access another student profile (403)', async () => {
    // Create Student document linked to studentUser1Id
    const student1 = await Student.create({
      studentCode: 'STU-U1',
      name: 'User 1 Student Profile',
      gender: 'FEMALE',
      dob: new Date(),
      centre: 'Centre A',
      userId: new mongoose.Types.ObjectId(studentUser1Id)
    });

    // studentUser1 requests own profile -> 200 OK
    const selfRes = await request(app)
      .get(`/api/students/${student1._id}`)
      .set('Authorization', `Bearer ${studentUser1Token}`);

    expect(selfRes.status).toBe(200);
    expect(selfRes.body.data.student.name).toBe('User 1 Student Profile');

    // studentUser2 attempts to access student1 profile -> 403 Forbidden
    const forbiddenRes = await request(app)
      .get(`/api/students/${student1._id}`)
      .set('Authorization', `Bearer ${studentUser2Token}`);

    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.success).toBe(false);
  });

  it('7. Update Student Profile - PATCH /api/students/:id', async () => {
    const student = await Student.create({
      studentCode: 'S4',
      name: 'David',
      gender: 'MALE',
      dob: new Date(),
      centre: 'Centre A',
      learningLevel: 'LEVEL_1'
    });

    const res = await request(app)
      .patch(`/api/students/${student._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        learningLevel: 'LEVEL_2',
        status: 'ACTIVE'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.student.learningLevel).toBe('LEVEL_2');
  });

  it('8. Create Progress Log - POST /api/students/:id/progress', async () => {
    const student = await Student.create({
      studentCode: 'S5',
      name: 'Eve',
      gender: 'FEMALE',
      dob: new Date(),
      centre: 'Centre A'
    });

    const res = await request(app)
      .post(`/api/students/${student._id}/progress`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        academicMetrics: { subject: 'Mathematics', score: 85, grade: 'A', remarks: 'Excellent progress' },
        healthMetrics: { heightCm: 140, weightKg: 35, attendancePercentage: 95 },
        socialEmotionalMetrics: { teamworkRating: 5, communicationRating: 4 },
        practicalProjectMetrics: { projectName: 'Science Model', completionStatus: 'COMPLETED', projectScore: 5 },
        evaluatedLevel: 'LEVEL_2'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.progress.academicMetrics.score).toBe(85);
    expect(res.body.data.progress.healthMetrics.heightCm).toBe(140);
  });

  it('9. Get Progress History & Ownership Enforcement - GET /api/students/:id/progress', async () => {
    const student1 = await Student.create({
      studentCode: 'S6',
      name: 'Frank',
      gender: 'MALE',
      dob: new Date(),
      centre: 'Centre A',
      userId: new mongoose.Types.ObjectId(studentUser1Id)
    });

    await Progress.create({
      studentId: student1._id,
      recordedBy: new mongoose.Types.ObjectId(studentUser1Id),
      academicMetrics: { subject: 'Science', score: 90 }
    });

    // studentUser1 retrieves own progress log -> 200 OK
    const res1 = await request(app)
      .get(`/api/students/${student1._id}/progress`)
      .set('Authorization', `Bearer ${studentUser1Token}`);

    expect(res1.status).toBe(200);
    expect(res1.body.data.progressHistory.length).toBe(1);

    // studentUser2 attempts to retrieve student1 progress log -> 403 Forbidden
    const res2 = await request(app)
      .get(`/api/students/${student1._id}/progress`)
      .set('Authorization', `Bearer ${studentUser2Token}`);

    expect(res2.status).toBe(403);
    expect(res2.body.success).toBe(false);
  });

  it('10. Member 2 Assessment Integration Helper - updateLearningLevel updates level and logs progress entry', async () => {
    const student = await Student.create({
      studentCode: 'S7',
      name: 'Grace',
      gender: 'FEMALE',
      dob: new Date(),
      centre: 'Centre A',
      learningLevel: 'LEVEL_1'
    });

    const updatedStudent = await updateLearningLevel(student._id.toString(), 'LEVEL_3', studentUser1Id);

    expect(updatedStudent.learningLevel).toBe('LEVEL_3');

    const progressLogs = await Progress.find({ studentId: student._id });
    expect(progressLogs.length).toBe(1);
    expect(progressLogs[0].evaluatedLevel).toBe('LEVEL_3');
  });

});
