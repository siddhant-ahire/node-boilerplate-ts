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

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });
});
