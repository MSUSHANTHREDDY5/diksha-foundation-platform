import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Program } from '../models/Program.js';
import { Activity } from '../models/Activity.js';
import { ProgramEnrollment } from '../models/ProgramEnrollment.js';
import { Task } from '../models/Task.js';

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
  await Program.deleteMany({});
  await Activity.deleteMany({});
  await ProgramEnrollment.deleteMany({});
  await Task.deleteMany({});

  const admin = await User.create({ name: 'Admin User', email: 'admin@test.com', password: 'password123', role: 'ADMIN' });
  const teacher = await User.create({ name: 'Teacher User', email: 'teacher@test.com', password: 'password123', role: 'TEACHER_VOLUNTEER' });
  const student1 = await User.create({ name: 'Student One User', email: 's1@test.com', password: 'password123', role: 'STUDENT' });
  const student2 = await User.create({ name: 'Student Two User', email: 's2@test.com', password: 'password123', role: 'STUDENT' });

  student1Id = student1._id.toString();
  student2Id = student2._id.toString();

  const secret = process.env.JWT_SECRET!;
  adminToken = jwt.sign({ id: admin._id.toString(), role: 'ADMIN', email: admin.email }, secret);
  teacherToken = jwt.sign({ id: teacher._id.toString(), role: 'TEACHER_VOLUNTEER', email: teacher.email }, secret);
  student1Token = jwt.sign({ id: student1Id, role: 'STUDENT', email: student1.email }, secret);
  student2Token = jwt.sign({ id: student2Id, role: 'STUDENT', email: student2.email }, secret);

  const studentDoc1 = await Student.create({
    studentCode: 'STU-P1',
    name: 'Student One',
    gender: 'FEMALE',
    dob: new Date(),
    centre: 'Delhi Centre',
    learningLevel: 'LEVEL_1',
    userId: new mongoose.Types.ObjectId(student1Id)
  });

  const studentDoc2 = await Student.create({
    studentCode: 'STU-P2',
    name: 'Student Two',
    gender: 'MALE',
    dob: new Date(),
    centre: 'Delhi Centre',
    learningLevel: 'LEVEL_2',
    userId: new mongoose.Types.ObjectId(student2Id)
  });

  student1DocId = studentDoc1._id.toString();
  student2DocId = studentDoc2._id.toString();
});

describe('Member 3: Programs, Activities & Tasks Integration Tests', () => {

  it('1. Program Creation - Admin/Teacher allowed (201), Student rejected (403)', async () => {
    // Teacher creates program -> Success
    const res = await request(app)
      .post('/api/programs')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Literacy Excellence Program',
        description: 'Comprehensive reading and writing track',
        category: 'ACADEMIC',
        targetLevel: 'LEVEL_1'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.program.title).toBe('Literacy Excellence Program');

    // Student attempts to create program -> 403 Forbidden
    const forbiddenRes = await request(app)
      .post('/api/programs')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        title: 'Student Created Program',
        category: 'ACADEMIC'
      });

    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.success).toBe(false);
  });

  it('2. Program Listing & Retrieval - GET /api/programs', async () => {
    await Program.create({
      title: 'Vocational Skills 101',
      category: 'VOCATIONAL',
      createdBy: new mongoose.Types.ObjectId(student1Id)
    });

    const res = await request(app)
      .get('/api/programs')
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.programs.length).toBe(1);
    expect(res.body.data.programs[0].title).toBe('Vocational Skills 101');
  });

  it('3. Program Enrollment & Duplicate Rejection (409)', async () => {
    const program = await Program.create({
      title: 'STEM Robotics',
      category: 'HOLISTIC',
      createdBy: new mongoose.Types.ObjectId(student1Id)
    });

    // Enroll student -> 201
    const res = await request(app)
      .post(`/api/programs/${program._id}/enrollments`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ studentId: student1DocId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.enrollment.status).toBe('ENROLLED');

    // Duplicate enrollment attempt -> 409
    const duplicateRes = await request(app)
      .post(`/api/programs/${program._id}/enrollments`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ studentId: student1DocId });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.success).toBe(false);
  });

  it('4. Student View Enrolled Programs - Server-side ownership check', async () => {
    const program = await Program.create({
      title: 'Life Skills Track',
      category: 'LIFE_SKILLS',
      createdBy: new mongoose.Types.ObjectId(student1Id)
    });

    await ProgramEnrollment.create({
      programId: program._id,
      studentId: new mongoose.Types.ObjectId(student1DocId),
      enrolledBy: new mongoose.Types.ObjectId(student1Id)
    });

    // Student 1 views own enrolled programs -> 200
    const res = await request(app)
      .get(`/api/students/${student1DocId}/programs`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.enrollments.length).toBe(1);

    // Student 2 attempts to view Student 1's enrolled programs -> 403 Forbidden
    const forbiddenRes = await request(app)
      .get(`/api/students/${student1DocId}/programs`)
      .set('Authorization', `Bearer ${student2Token}`);

    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.success).toBe(false);
  });

  it('5. Activity Creation & Listing under Program', async () => {
    const program = await Program.create({
      title: 'Phonetics Masterclass',
      category: 'ACADEMIC',
      createdBy: new mongoose.Types.ObjectId(student1Id)
    });

    // Create Activity -> 201
    const createRes = await request(app)
      .post(`/api/programs/${program._id}/activities`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Phonetics Session 1',
        activityType: 'WORKSHOP',
        scheduledDate: new Date()
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.activity.title).toBe('Phonetics Session 1');

    // List Activities -> 200
    const listRes = await request(app)
      .get(`/api/programs/${program._id}/activities`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.activities.length).toBe(1);
  });

  it('6. Task Creation & Validation of Referenced Resources', async () => {
    const program = await Program.create({
      title: 'Math Bootcamp',
      category: 'ACADEMIC',
      createdBy: new mongoose.Types.ObjectId(student1Id)
    });

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Solve Homework 4',
        description: 'Complete page 12 to 15',
        studentId: student1DocId,
        programId: program._id.toString(),
        priority: 'HIGH'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.task.status).toBe('PENDING');
    expect(res.body.data.task.priority).toBe('HIGH');
  });

  it('7. Student Task Access & Ownership Enforcement', async () => {
    await Task.create({
      title: 'Student 1 Task',
      studentId: new mongoose.Types.ObjectId(student1DocId),
      assignedBy: new mongoose.Types.ObjectId(student1Id),
      priority: 'MEDIUM',
      status: 'PENDING'
    });

    // Student 1 gets own tasks -> 200
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tasks.length).toBe(1);

    // Student 2 attempts to filter tasks by Student 1 ID -> 403 Forbidden
    const forbiddenRes = await request(app)
      .get(`/api/tasks?studentId=${student1DocId}`)
      .set('Authorization', `Bearer ${student2Token}`);

    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.success).toBe(false);
  });

  it('8. Student Update Task Status & OutcomeNotes - Restricts Administrative Field Mutation', async () => {
    const task = await Task.create({
      title: 'Original Title',
      description: 'Original Description',
      studentId: new mongoose.Types.ObjectId(student1DocId),
      assignedBy: new mongoose.Types.ObjectId(student1Id),
      priority: 'LOW',
      status: 'PENDING'
    });

    // Student 1 updates status to COMPLETED & adds outcomeNotes -> 200 (Sets completedAt)
    const updateRes = await request(app)
      .patch(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        status: 'COMPLETED',
        outcomeNotes: 'Finished exercises successfully'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.task.status).toBe('COMPLETED');
    expect(updateRes.body.data.task.completedAt).toBeDefined();

    // Student 1 attempts to modify administrative title field -> 403 Forbidden
    const restrictedRes = await request(app)
      .patch(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        title: 'Tampered Title'
      });

    expect(restrictedRes.status).toBe(403);
    expect(restrictedRes.body.success).toBe(false);
  });

  it('9. Task Comments - Add comment & validate empty message rejection (400)', async () => {
    const task = await Task.create({
      title: 'Project Assignment',
      studentId: new mongoose.Types.ObjectId(student1DocId),
      assignedBy: new mongoose.Types.ObjectId(student1Id),
      priority: 'MEDIUM',
      status: 'PENDING'
    });

    // Valid comment -> 201
    const commentRes = await request(app)
      .post(`/api/tasks/${task._id}/comments`)
      .set('Authorization', `Bearer ${student1Token}`)
      .send({ message: 'I have started working on this assignment' });

    expect(commentRes.status).toBe(201);
    expect(commentRes.body.success).toBe(true);
    expect(commentRes.body.data.comment.message).toBe('I have started working on this assignment');
    expect(commentRes.body.data.comment.authorRole).toBe('STUDENT');

    // Empty message -> 400
    const emptyRes = await request(app)
      .post(`/api/tasks/${task._id}/comments`)
      .set('Authorization', `Bearer ${student1Token}`)
      .send({ message: '   ' });

    expect(emptyRes.status).toBe(400);
    expect(emptyRes.body.success).toBe(false);
  });

  it('10. Invalid ObjectId and Missing Resource Error Handling', async () => {
    // Invalid ObjectId format -> 400
    const invalidRes = await request(app)
      .get('/api/programs/invalid-id-format')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(invalidRes.status).toBe(400);

    // Non-existent ObjectId -> 404
    const fakeId = new mongoose.Types.ObjectId().toString();
    const notFoundRes = await request(app)
      .get(`/api/programs/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(notFoundRes.status).toBe(404);
  });

});
