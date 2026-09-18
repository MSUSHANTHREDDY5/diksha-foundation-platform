import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../index.js';
import { User } from '../models/User.js';
import { authorize } from '../middleware/role.middleware.js';
import { Request, Response } from 'express';

let mongoServer: MongoMemoryServer;

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
});

describe('Phase 1: Shared Authentication & User Infrastructure Tests', () => {
  
  it('1. Health Check - GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('2. User Registration Success - POST /api/auth/register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Student',
        email: 'student@example.com',
        password: 'password123',
        role: 'STUDENT'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe('student@example.com');
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.token).toBeDefined();
  });

  it('3. Password Hashing - Stored user password must be hashed in MongoDB', async () => {
    const plainPassword = 'securePassword123';
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Hash Test User',
        email: 'hashtest@example.com',
        password: plainPassword
      });

    const userInDb = await User.findOne({ email: 'hashtest@example.com' }).select('+password');
    expect(userInDb).not.toBeNull();
    expect(userInDb!.password).not.toBe(plainPassword);
    expect(userInDb!.password!.startsWith('$2a$') || userInDb!.password!.startsWith('$2b$')).toBe(true);
  });

  it('4. Duplicate Email Rejection - POST /api/auth/register with duplicate email returns 409', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'duplicate@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'duplicate@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('5. Public ADMIN Registration Restriction - POST /api/auth/register with ADMIN returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Malicious Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'ADMIN'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Public registration of ADMIN role is not permitted');
  });

  it('6. Invalid Runtime Role Restriction - POST /api/auth/register with invalid role returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invalid Role User',
        email: 'invalidrole@example.com',
        password: 'password123',
        role: 'SUPERADMIN'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid role provided for registration');
  });

  it('7. Login Success - POST /api/auth/login returns valid user and token', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'correctPassword'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'correctPassword'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('login@example.com');
  });

  it('8. Wrong Password Rejection - POST /api/auth/login with wrong password returns 401', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'loginwrong@example.com',
        password: 'correctPassword'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'loginwrong@example.com',
        password: 'wrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('9. Current User Endpoint - GET /api/auth/me with valid Bearer token returns 200', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Authenticated User',
        email: 'authme@example.com',
        password: 'password123'
      });

    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('authme@example.com');
  });

  it('10. Missing Token Rejection - GET /api/auth/me without token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('11. Invalid Token Rejection - GET /api/auth/me with invalid token returns 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_token_string');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('12. Role Authorization Middleware - Allowed role proceeds, unauthorized role returns 403', () => {
    const req = { user: { id: '123', role: 'TEACHER_VOLUNTEER', email: 'teacher@example.com' } } as Request;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    // Test allowed role
    const teacherMiddleware = authorize('TEACHER_VOLUNTEER', 'ADMIN');
    teacherMiddleware(req, {} as Response, next);
    expect(nextCalled).toBe(true);

    // Test forbidden role
    let resStatus = 0;
    let resJson: any = null;
    const mockRes = {
      status: (code: number) => {
        resStatus = code;
        return {
          json: (data: any) => { resJson = data; }
        };
      }
    } as unknown as Response;

    const adminOnlyMiddleware = authorize('ADMIN');
    adminOnlyMiddleware(req, mockRes, () => {});

    expect(resStatus).toBe(403);
    expect(resJson.success).toBe(false);
    expect(resJson.message).toContain('Forbidden');
  });

  it('13. JWT Claims Test - Decoded JWT payload must contain id, role, and email', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Claims User',
        email: 'claims@example.com',
        password: 'password123',
        role: 'TEACHER_VOLUNTEER'
      });

    const token = regRes.body.data.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    expect(decoded.id).toBeDefined();
    expect(decoded.id).toBe(regRes.body.data.user.id);
    expect(decoded.role).toBe('TEACHER_VOLUNTEER');
    expect(decoded.email).toBe('claims@example.com');
  });

  it('14. Tampered JWT Test - GET /api/auth/me with tampered token returns 401', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Tamper User',
        email: 'tamper@example.com',
        password: 'password123'
      });

    const validToken = regRes.body.data.token;
    const tamperedToken = validToken + 'tampered';

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tamperedToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

});
