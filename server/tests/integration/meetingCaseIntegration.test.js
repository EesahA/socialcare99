const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Import the main app components
const authRoutes = require('../../routes/auth');
const casesRoutes = require('../../routes/cases');
const meetingsRoutes = require('../../routes/meetings');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/meetings', meetingsRoutes);

describe('Meeting-Case Integration', () => {
  let testUser;
  let authToken;
  let testCase;
  let testMeeting;

  beforeEach(async () => {
    // Clear any existing data
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }

    // Create a test user
    const User = require('../../models/User');
    testUser = new User({
      email: 'integration@example.gov.uk',
      password: 'IntegrationPassword123!',
      firstName: 'Integration',
      lastName: 'TestUser',
      role: 'caregiver'
    });
    await testUser.save();

    // Generate auth token
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  test('Create case → schedule meeting → verify meeting linked to case', async () => {
    // Step 1: Create a new case
    const caseData = {
      caseId: 'INTEGRATION002',
      clientFullName: 'Jane Doe',
      dateOfBirth: '1975-05-15',
      clientReferenceNumber: 'REF002',
      caseType: 'Assessment',
      caseStatus: 'Open'
    };

    const caseResponse = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${authToken}`)
      .send(caseData)
      .expect(201);

    expect(caseResponse.body.caseId).toBe(caseData.caseId);
    expect(caseResponse.body.clientFullName).toBe(caseData.clientFullName);
    expect(caseResponse.body.caseType).toBe(caseData.caseType);
    expect(caseResponse.body.createdBy).toBe(testUser.id);

    testCase = caseResponse.body;

    // Step 2: Schedule a meeting for that case
    const meetingData = {
      title: 'Initial Assessment Meeting',
      description: 'First meeting to assess client needs',
      scheduledAt: '2025-12-31T10:00:00.000Z',
      duration: 90,
      meetingType: 'Home Visit',
      location: 'Client Home',
      attendees: 'Integration TestUser, Jane Doe',
      caseId: testCase.id,
      caseName: testCase.clientFullName
    };

    const meetingResponse = await request(app)
      .post('/api/meetings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(meetingData)
      .expect(201);

    expect(meetingResponse.body.title).toBe(meetingData.title);
    expect(meetingResponse.body.caseId).toBe(testCase.id);
    expect(meetingResponse.body.caseName).toBe(testCase.clientFullName);
    expect(meetingResponse.body.meetingType).toBe(meetingData.meetingType);
    expect(meetingResponse.body.duration).toBe(meetingData.duration);
    expect(meetingResponse.body.createdBy).toBe(testUser.id);

    testMeeting = meetingResponse.body;

    // Step 3: Verify the meeting appears when getting meetings for the user
    const meetingsResponse = await request(app)
      .get('/api/meetings')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(meetingsResponse.body)).toBe(true);
    expect(meetingsResponse.body.length).toBe(1);
    expect(meetingsResponse.body[0].id).toBe(testMeeting.id);
    expect(meetingsResponse.body[0].title).toBe(testMeeting.title);
    expect(meetingsResponse.body[0].caseId).toBe(testCase.id);
    expect(meetingsResponse.body[0].caseName).toBe(testCase.clientFullName);

    // Step 4: Verify the case can still be retrieved and contains expected data
    const caseRetrievalResponse = await request(app)
      .get(`/api/cases/${testCase.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(caseRetrievalResponse.body.id).toBe(testCase.id);
    expect(caseRetrievalResponse.body.caseId).toBe(testCase.caseId);
    expect(caseRetrievalResponse.body.clientFullName).toBe(testCase.clientFullName);

    // Step 5: Verify the relationship integrity - meeting references the correct case
    expect(testMeeting.caseId).toBe(testCase.id);
    expect(testMeeting.caseName).toBe(testCase.clientFullName);
    expect(testMeeting.createdBy).toBe(testCase.createdBy);

    // Step 6: Verify meeting details are properly formatted
    expect(testMeeting.scheduledAt).toBeDefined();
    expect(new Date(testMeeting.scheduledAt)).toBeInstanceOf(Date);
    expect(testMeeting.duration).toBe(90);
    expect(testMeeting.meetingType).toBe('Home Visit');
    expect(testMeeting.location).toBe('Client Home');
  });
}); 