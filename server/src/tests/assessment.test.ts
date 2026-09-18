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
import { SelfEvaluation } from '../models/SelfEvaluation.js';
import { PeerReview } from '../models/PeerReview.js';

let mongoServer: MongoMemoryServer;
let adminToken: string;
let teacherToken: string;
let student1Token: string;
let student2Token: string;
let student1Id: string;
let student2Id: string;
let student1DocId: string;
let student2DocId: string;

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
  await SelfEvaluation.deleteMany({});
  await PeerReview.deleteMany({});

  const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'ADMIN' });
  const teacher = await User.create({ name: 'Teacher', email: 'teacher@test.com', password: 'password123', role: 'TEACHER_VOLUNTEER' });
  const student1 = await User.create({ name: 'Student 1', email: 's1@test.com', password: 'password123', role: 'STUDENT' });
  const student2 = await User.create({ name: 'Student 2', email: 's2@test.com', password: 'password123', role: 'STUDENT' });

  student1Id = student1._id.toString();
  student2Id = student2._id.toString();

  const secret = process.env.JWT_SECRET!;
  adminToken = jwt.sign({ id: admin._id.toString(), role: 'ADMIN', email: admin.email }, secret);
  teacherToken = jwt.sign({ id: teacher._id.toString(), role: 'TEACHER_VOLUNTEER', email: teacher.email }, secret);
  student1Token = jwt.sign({ id: student1Id, role: 'STUDENT', email: student1.email }, secret);
  student2Token = jwt.sign({ id: student2Id, role: 'STUDENT', email: student2.email }, secret);

  const studentDoc1 = await Student.create({
    studentCode: 'STU-A1',
    name: 'Student One',
    gender: 'FEMALE',
    dob: new Date(),
    centre: 'Delhi Centre',
    learningLevel: 'LEVEL_1',
    userId: new mongoose.Types.ObjectId(student1Id)
  });

  const studentDoc2 = await Student.create({
    studentCode: 'STU-A2',
    name: 'Student Two',
    gender: 'MALE',
    dob: new Date(),
    centre: 'Delhi Centre',
    learningLevel: 'LEVEL_1',
    userId: new mongoose.Types.ObjectId(student2Id)
  });

  student1DocId = studentDoc1._id.toString();
  student2DocId = studentDoc2._id.toString();
});

describe('Member 2: Assessments & Student Evaluation Integration Tests', () => {

  it('1. DRAFT Assessment Creation - Does NOT update Student.learningLevel or create Progress log', async () => {
    const res = await request(app)
      .post(`/api/students/${student1DocId}/assessments`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Draft Reading Assessment',
        category: 'ACADEMIC',
        score: 60,
        status: 'DRAFT'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assessment.status).toBe('DRAFT');
    expect(res.body.data.levelUpdated).toBe(false);

    // Verify Student.learningLevel remains LEVEL_1
    const student = await Student.findById(student1DocId);
    expect(student!.learningLevel).toBe('LEVEL_1');

    // Verify NO progress log was created
    const progressLogs = await Progress.find({ studentId: student1DocId });
    expect(progressLogs.length).toBe(0);
  });

  it('2. COMPLETED Assessment Creation - Triggers updateLearningLevel and logs Progress entry', async () => {
    const res = await request(app)
      .post(`/api/students/${student1DocId}/assessments`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Math Assessment',
        category: 'ACADEMIC',
        score: 95,
        status: 'COMPLETED',
        evaluatedLevel: 'LEVEL_2'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.levelUpdated).toBe(true);

    // Verify Student.learningLevel updated to LEVEL_2
    const student = await Student.findById(student1DocId);
    expect(student!.learningLevel).toBe('LEVEL_2');

    // Verify Progress log was created by Member 1 helper
    const progressLogs = await Progress.find({ studentId: student1DocId });
    expect(progressLogs.length).toBe(1);
    expect(progressLogs[0].evaluatedLevel).toBe('LEVEL_2');
  });

  it('3. Missing evaluatedLevel on COMPLETED creation returns 400', async () => {
    const res = await request(app)
      .post(`/api/students/${student1DocId}/assessments`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Invalid Completed Assessment',
        category: 'ACADEMIC',
        score: 80,
        status: 'COMPLETED'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('4. DRAFT -> COMPLETED Transition via PATCH calls helper exactly once', async () => {
    const draftRes = await request(app)
      .post(`/api/students/${student1DocId}/assessments`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Midterm Draft',
        score: 88,
        status: 'DRAFT'
      });

    const assessmentId = draftRes.body.data.assessment._id;

    // Transition DRAFT -> COMPLETED
    const patchRes = await request(app)
      .patch(`/api/assessments/${assessmentId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        status: 'COMPLETED',
        evaluatedLevel: 'LEVEL_3'
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.levelUpdated).toBe(true);

    const student = await Student.findById(student1DocId);
    expect(student!.learningLevel).toBe('LEVEL_3');

    const progressLogs = await Progress.find({ studentId: student1DocId });
    expect(progressLogs.length).toBe(1);
  });

  it('5. COMPLETED -> COMPLETED Idempotency - Does NOT create duplicate Progress record', async () => {
    const createRes = await request(app)
      .post(`/api/students/${student1DocId}/assessments`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Completed Test',
        score: 90,
        status: 'COMPLETED',
        evaluatedLevel: 'LEVEL_2'
      });

    const assessmentId = createRes.body.data.assessment._id;

    // Patch already COMPLETED assessment with COMPLETED status
    const patchRes = await request(app)
      .patch(`/api/assessments/${assessmentId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        status: 'COMPLETED',
        feedback: 'Updated remarks'
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.levelUpdated).toBe(false);

    // Progress logs should remain exactly 1
    const progressLogs = await Progress.find({ studentId: student1DocId });
    expect(progressLogs.length).toBe(1);
  });

  it('6. DRAFT -> COMPLETED Transition without evaluatedLevel returns 400', async () => {
    const draftRes = await request(app)
      .post(`/api/students/${student1DocId}/assessments`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Draft Assessment',
        score: 75,
        status: 'DRAFT'
      });

    const assessmentId = draftRes.body.data.assessment._id;

    const patchRes = await request(app)
      .patch(`/api/assessments/${assessmentId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        status: 'COMPLETED'
      });

    expect(patchRes.status).toBe(400);
    expect(patchRes.body.success).toBe(false);
  });

  it('7. Self Peer Review Restriction - Returns 400 when reviewing own student profile', async () => {
    const res = await request(app)
      .post(`/api/students/${student1DocId}/peer-reviews`)
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        collaborationScore: 5,
        helpfulnessScore: 5,
        positiveFeedback: 'I am great'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Self peer-review is prohibited');
  });

  it('8. Valid Peer Review Submission between different students', async () => {
    const res = await request(app)
      .post(`/api/students/${student2DocId}/peer-reviews`)
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        collaborationScore: 5,
        helpfulnessScore: 4,
        positiveFeedback: 'Great teamwork in group activity'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.peerReview.collaborationScore).toBe(5);
  });

  it('9. Server-Side Ownership Enforcement - Student cannot access peer assessment history (403)', async () => {
    await Assessment.create({
      studentId: new mongoose.Types.ObjectId(student1DocId),
      evaluatorId: new mongoose.Types.ObjectId(student2Id),
      title: 'Private Assessment',
      score: 90,
      status: 'COMPLETED',
      evaluatedLevel: 'LEVEL_1'
    });

    const forbiddenRes = await request(app)
      .get(`/api/students/${student1DocId}/assessments`)
      .set('Authorization', `Bearer ${student2Token}`);

    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.success).toBe(false);
  });

});
