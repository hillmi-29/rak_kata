import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';
import { createTestUser, getAuthToken } from '../helpers';

describe('Auth API', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Clean up any existing test users
    await prisma.user.deleteMany({
      where: { email: { contains: 'authtest' } }
    });
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.user.deleteMany({
      where: { email: { contains: 'authtest' } }
    });
    // Create fresh test user for each test
    testUser = await createTestUser({
      email: 'authtest@example.com',
      name: 'Auth Test User',
    });
    authToken = await getAuthToken(testUser.id);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'authtest' } }
    });
  });

  it('POST /api/v1/auth/register - should register new user', async () => {
    const uniqueEmail = `newuser-${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        name: 'New User',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('POST /api/v1/auth/login - should login existing user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    authToken = res.body.data.accessToken;
  });

  it('GET /api/v1/auth/me - should return current user', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('POST /api/v1/auth/logout - should logout user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});