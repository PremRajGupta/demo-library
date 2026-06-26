import './setup.mjs';
import request from 'supertest';
import app from '../src/server.js';
import mongoose from 'mongoose';
import Seat from '../src/models/Seat.js';
import Student from '../src/models/Student.js';

describe('Seat Module', () => {
  const token = 'Bearer mock-token';

  describe('GET /api/v1/seats', () => {
    it('should return empty array initially', async () => {
      const response = await request(app)
        .get('/api/v1/seats')
        .set('Authorization', token);
      
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });

    it('should return seats when they exist', async () => {
      await Seat.create({
        seatNumber: 'A1',
        organizationId: 'org1',
        branchId: 'branch1'
      });

      const response = await request(app)
        .get('/api/v1/seats')
        .set('Authorization', token);
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].seatNumber).toBe('A1');
    });
  });

  describe('PUT /api/v1/seats/:id', () => {
    it('should update seat status to occupied', async () => {
      // Create a student first
      const student = await Student.create({
        name: 'Seat Student',
        studentId: 'SEAT123',
        mobile: '1234567890',
        email: 'seat@student.com',
        branchId: new mongoose.Types.ObjectId().toString(),
        organizationId: 'org1',
        fatherName: 'Father',
        feeAmount: 500,
        course: 'Physics',
        address: 'Test'
      });

      const response = await request(app)
        .put('/api/v1/seats/A2')
        .set('Authorization', token)
        .send({
          status: 'occupied',
          studentDisplayId: 'SEAT123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('occupied');
      expect(response.body.studentName).toBe('Seat Student');
    });

    it('should update seat status to available and clear student info', async () => {
      const seat = await Seat.create({
        seatNumber: 'A3',
        organizationId: 'org1',
        branchId: 'branch1',
        status: 'occupied',
        studentName: 'Some Student'
      });

      const response = await request(app)
        .put(`/api/v1/seats/${seat._id}`)
        .set('Authorization', token)
        .send({ status: 'available' });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('available');
      expect(response.body.studentName).toBeNull();
    });
  });
});
