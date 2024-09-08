import { agent as request } from 'supertest';
const bcrypt = require('bcryptjs');
import httpStatus from 'http-status';
import app from '@/src/app';
import prisma from '@/src/db';

jest.mock('bcryptjs'); // Mock the entire bcrypt module

// Mock Prisma directly in the test file
jest.mock('@/src/db', () => {
  return {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
});

describe('POST /api/v1/auth/register', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // Reset mocks before each test
  });
  it('should return 200 for a valid request', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // No user found
    const response = await request(app).post('/api/v1/auth/register').send({
      user_name: 'admin',
      user_email: 'admin@example.com',
      user_password: '123456',
    });

    expect(response.status).toBe(httpStatus.OK);
  });

  it('should return 400 for an invalid request', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({}); // Sending invalid data

    expect(response.status).toBe(400);
  });
  it('should return 500 if the user already exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({}); // Simulate user exists

    const response = await request(app).post('/api/v1/auth/register').send({
      user_name: 'admin',
      user_email: 'admin@example.com',
      user_password: '123456',
    });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Error in register');
    expect(response.body.error).toBe('User already exists');
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // Reset mocks before each test
  });
  it('should return 200 for a valid request', async () => {
    // Mock bcrypt.compare to always return true
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Mock Prisma to return any arbitrary user data
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      user_id: 1, // Arbitrary user_id
      user_password: 'mockedHashedPassword', // Arbitrary hashed password
    });
    const response = await request(app).post('/api/v1/auth/login').send({
      user_email: 'admin@example.com',
      user_password: '123456',
    });

    expect(response.status).toBe(httpStatus.OK);
  });

  it('should return 400 for an invalid request', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({}); // Sending invalid data

    expect(response.status).toBe(400);
  });
});

describe('GET /api/v1/auth', () => {
  beforeEach(() => {
    jest.resetAllMocks(); // Reset mocks before each test
  });
  it('should return 200 OK and correct response', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({});
    let token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJpYXQiOjE3MjUxODI4ODgsImV4cCI6MTcyNTI2OTI4OH0.JF-YB8UdDfj_mjOV4U5mBTVr2HeqFYLXFF93Ft4-l9A';
    const response = await request(app)
      .get('/api/v1/auth')
      .set('Authorization', `Bearer ${token}`); // Simulate a request with token

    expect(response.status).toBe(httpStatus.OK);
  });
});
