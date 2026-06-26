import './setup.mjs';
import requestSupertest from 'supertest';
import app from '../src/server.js';

describe('Request Module', () => {
  const token = 'Bearer mock-token';

  describe('GET /api/v1/requests', () => {
    it('should return 200 and an empty array initially', async () => {
      const response = await requestSupertest(app)
        .get('/api/v1/requests')
        .set('Authorization', token);
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });
});
