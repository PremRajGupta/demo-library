import './setup.mjs';
import request from 'supertest';
import app from '../src/server.js';

describe('Fee Module', () => {
  const token = 'Bearer mock-token';

  describe('GET /api/v1/fees', () => {
    it('should return 200 and an empty array initially', async () => {
      const response = await request(app)
        .get('/api/v1/fees')
        .set('Authorization', token);
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/v1/fees', () => {
    it('should return 404 for missing student', async () => {
      const response = await request(app)
        .post('/api/v1/fees')
        .set('Authorization', token)
        .send({});
      
      expect(response.status).toBe(404);
    });
  });
});
