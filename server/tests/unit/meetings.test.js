const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import the meetings routes
const meetingsRoutes = require('../../routes/meetings');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/meetings', meetingsRoutes);

describe('Meeting Management Routes', () => {
  let testUser;
  let testToken;
  let testMeeting;

  beforeEach(async () => {
    // Create test user for each test
    const User = require('../../models/User');
    
    testUser = new User({
      email: 'testuser@example.gov.uk',
      password: await bcrypt.hash('Password123!', 10),
      firstName: 'John',
      lastName: 'TestUser',
      role: 'caregiver'
    });
    await testUser.save();

    // Generate token
    testToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  describe('POST /api/meetings', () => {
    test('should create meeting with valid data', async () => {
      const meetingData = {
        title: 'Client Assessment Meeting',
        description: 'Initial assessment meeting with client',
        scheduledAt: '2025-12-31T10:00:00.000Z',
        duration: 90,
        meetingType: 'Home Visit',
        location: 'Client Home',
        attendees: 'John TestUser, Client',
        caseId: 'CASE001',
        caseName: 'John Smith Case'
      };

      const response = await request(app)
        .post('/api/meetings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(meetingData)
        .expect(201);

      expect(response.body.title).toBe(meetingData.title);
      expect(response.body.description).toBe(meetingData.description);
      expect(response.body.duration).toBe(meetingData.duration);
      expect(response.body.meetingType).toBe(meetingData.meetingType);
      expect(response.body.location).toBe(meetingData.location);
      expect(response.body.caseId).toBe(meetingData.caseId);
      expect(response.body.caseName).toBe(meetingData.caseName);
      expect(response.body.createdBy).toBe(testUser.id);
      expect(response.body).toHaveProperty('scheduledAt');
    });

    test('should return 400 for missing required fields', async () => {
      const meetingData = {
        description: 'Meeting description',
        duration: 60,
        meetingType: 'Home Visit'
        // Missing title, scheduledAt, caseId, caseName
      };

      const response = await request(app)
        .post('/api/meetings')
        .set('Authorization', `Bearer ${testToken}`)
        .send(meetingData)
        .expect(400);

      expect(response.body.message).toBe('Missing required fields');
    });
  });

  describe('PUT /api/meetings/:id', () => {
    beforeEach(async () => {
      // Create a test meeting
      const Meeting = require('../../models/Meeting');
      testMeeting = new Meeting({
        title: 'Test Meeting',
        description: 'Meeting to update',
        scheduledAt: new Date('2025-12-31T10:00:00.000Z'),
        duration: 60,
        meetingType: 'Home Visit',
        location: 'Test Location',
        caseId: 'CASE001',
        caseName: 'Test Case',
        createdBy: testUser.id
      });
      await testMeeting.save();
    });

    test('should update meeting details (rescheduling)', async () => {
      const updateData = {
        title: 'Updated Meeting Title',
        scheduledAt: '2025-12-31T14:00:00.000Z',
        duration: 120,
        location: 'New Location'
      };

      const response = await request(app)
        .put(`/api/meetings/${testMeeting.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Updated Meeting Title');
      expect(response.body.duration).toBe(120);
      expect(response.body.location).toBe('New Location');
      expect(response.body).toHaveProperty('updatedAt');
    });

    test('should return 404 when updating non-existent meeting', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/meetings/${nonExistentId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Meeting not found');
    });
  });

  describe('GET /api/meetings', () => {
    beforeEach(async () => {
      // Create test meetings
      const Meeting = require('../../models/Meeting');
      
      const meeting1 = new Meeting({
        title: 'Meeting 1',
        description: 'First meeting',
        scheduledAt: new Date('2025-12-31T09:00:00.000Z'),
        duration: 60,
        meetingType: 'Home Visit',
        caseId: 'CASE001',
        caseName: 'Test Case 1',
        createdBy: testUser.id
      });
      await meeting1.save();

      const meeting2 = new Meeting({
        title: 'Meeting 2',
        description: 'Second meeting',
        scheduledAt: new Date('2025-12-31T14:00:00.000Z'),
        duration: 90,
        meetingType: 'Office Meeting',
        caseId: 'CASE002',
        caseName: 'Test Case 2',
        createdBy: testUser.id
      });
      await meeting2.save();
    });

    test('should get meetings for authenticated user', async () => {
      const response = await request(app)
        .get('/api/meetings')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.some(m => m.title === 'Meeting 1')).toBe(true);
      expect(response.body.some(m => m.title === 'Meeting 2')).toBe(true);
      expect(response.body[0].createdBy).toBe(testUser.id);
      expect(response.body[1].createdBy).toBe(testUser.id);
    });
  });

  describe('DELETE /api/meetings/:id', () => {
    beforeEach(async () => {
      // Create a test meeting
      const Meeting = require('../../models/Meeting');
      testMeeting = new Meeting({
        title: 'Meeting to Delete',
        description: 'This meeting will be deleted',
        scheduledAt: new Date('2025-12-31T10:00:00.000Z'),
        duration: 60,
        meetingType: 'Home Visit',
        caseId: 'CASE001',
        caseName: 'Test Case',
        createdBy: testUser.id
      });
      await testMeeting.save();
    });

    test('should delete meeting successfully', async () => {
      const response = await request(app)
        .delete(`/api/meetings/${testMeeting.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.message).toBe('Meeting deleted successfully');

      // Verify meeting was actually deleted
      const Meeting = require('../../models/Meeting');
      const deletedMeeting = await Meeting.findById(testMeeting.id);
      expect(deletedMeeting).toBeNull();
    });
  });
}); 