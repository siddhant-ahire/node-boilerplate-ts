import { agent as request } from 'supertest';

import httpStatus from 'http-status';
import app from '@/src/app';

describe('GET /api/v1/health', () => {
  it('should return 200 OK and correct response', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body).toHaveProperty('message', 'Hey everything is OK');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('data');
  });
});
