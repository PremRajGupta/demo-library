import './setup.mjs';
import request from 'supertest';
import app from '../src/server.js';
import mongoose from 'mongoose';
import Student from '../src/models/Student.js';

describe('Student Module', () => {
  const token = 'Bearer mock-token'; // verifyToken middleware uses req.user = { uid: 'dev-user' }

  describe('GET /api/v1/students', () => {
    it('should return 200 and an empty array initially', async () => {
      const response = await request(app)
        .get('/api/v1/students')
        .set('Authorization', token);
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });

    it('should return students when they exist', async () => {
      await Student.create({
        name: 'Test Student',
        studentId: '12345',
        mobile: '9876543210',
        email: 'test@student.com',
        branchId: new mongoose.Types.ObjectId().toString(),
        organizationId: 'org1',
        fatherName: 'Father',
        feeAmount: 500,
        course: 'Physics',
        address: 'Test Address'
      });

      const response = await request(app)
        .get('/api/v1/students')
        .set('Authorization', token);
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Test Student');
    });
  });

  describe('POST /api/v1/students', () => {
    it('should create a new student', async () => {
      const newStudent = {
        name: 'Jane Doe',
        studentId: '54321',
        mobile: '1234567890',
        email: 'jane@student.com',
        branchId: new mongoose.Types.ObjectId().toString(),
        organizationId: 'org1',
        fatherName: 'Father',
        feeAmount: 500,
        course: 'Physics',
        address: 'Jane Address'
      };

      const response = await request(app)
        .post('/api/v1/students')
        .set('Authorization', token)
        .send(newStudent);
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Jane Doe');
      expect(response.body.studentId).toMatch(/^STU[a-z]+_\d{4}$/);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/students')
        .set('Authorization', token)
        .send({
          name: 'Jane Doe' // Missing required fields
        });
      
      expect(response.status).toBe(400); // Bad request
    });
  });
});
