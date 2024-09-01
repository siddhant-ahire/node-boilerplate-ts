import { agent as request } from 'supertest';

import httpStatus from 'http-status';
import app from '@/src/app';
import prisma from '@/src/db';

// Mock Prisma directly in the test file
jest.mock('@/src/db', () => {
  return {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
});

describe('POST /api/v1/user/register', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // Reset mocks before each test
  });
  it('should return 200 for a valid request', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // No user found
    const response = await request(app).post('/api/v1/user/register').send({
      user_name: 'admin',
      user_email: 'admin@example.com',
      user_password: '123456',
    });

    expect(response.status).toBe(httpStatus.OK);
  });

  it('should return 400 for an invalid request', async () => {
    const response = await request(app).post('/api/v1/user/register').send({}); // Sending invalid data

    expect(response.status).toBe(400);
  });
  it('should return 500 if the user already exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({}); // Simulate user exists

    const response = await request(app).post('/api/v1/user/register').send({
      user_name: 'admin',
      user_email: 'admin@example.com',
      user_password: '123456',
    });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Error in register');
    expect(response.body.error).toBe('User already exists');
  });
});

describe('POST /api/v1/user/login', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // Reset mocks before each test
  });
  it('should return 200 for a valid request', async () => {
    // Simulate a successful user lookup
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      user_id: 1,
      user_password:
        '$2a$10$sXzcNpo3CXmKsSTO7GRLAezV935dhW9.QW1Uuv5rV.JvCEhW8YGW.', // Assume password is hashed correctly
    });
    const response = await request(app).post('/api/v1/user/login').send({
      user_email: 'admin@example.com',
      user_password: '123456',
    });

    expect(response.status).toBe(httpStatus.OK);
  });

  it('should return 400 for an invalid request', async () => {
    const response = await request(app).post('/api/v1/user/login').send({}); // Sending invalid data

    expect(response.status).toBe(400);
  });
});

describe('GET /api/v1/user', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // Reset mocks before each test
  });
  it('should return 200 OK and correct response', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({});
    let token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJpYXQiOjE3MjUxODI4ODgsImV4cCI6MTcyNTI2OTI4OH0.JF-YB8UdDfj_mjOV4U5mBTVr2HeqFYLXFF93Ft4-l9A';
    const response = await request(app)
      .get('/api/v1/user')
      .set('Authorization', `Bearer ${token}`); // Simulate a request with token

    expect(response.status).toBe(httpStatus.OK);
  });
});
