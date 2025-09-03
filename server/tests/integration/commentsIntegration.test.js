const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Import the main app components
const authRoutes = require('../../routes/auth');
const casesRoutes = require('../../routes/cases');
const caseCommentsRoutes = require('../../routes/caseComments');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', caseCommentsRoutes);
app.use('/api/cases', casesRoutes);

describe('Comments Integration', () => {
  let testUser;
  let authToken;
  let testCase;

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
      { id: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  test('Create case → add comment → verify comment appears in case', async () => {
    // Step 1: Create a new case
    const caseData = {
      caseId: 'INTEGRATION003',
      clientFullName: 'Bob Wilson',
      dateOfBirth: '1985-08-20',
      clientReferenceNumber: 'REF003',
      caseType: 'Support',
      caseStatus: 'Open'
    };

    const caseResponse = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${authToken}`)
      .send(caseData)
      .expect(201);

    expect(caseResponse.body.caseId).toBe(caseData.caseId);
    expect(caseResponse.body.clientFullName).toBe(caseData.clientFullName);
    expect(caseResponse.body.createdBy.toString()).toBe(testUser._id.toString());

    testCase = caseResponse.body;

    // Step 2: Add a comment to the case
    const commentData = {
      text: 'Initial case assessment completed. Client shows good engagement.'
    };

    const commentResponse = await request(app)
      .post(`/api/cases/${testCase.id}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(commentData)
      .expect(201);

    expect(commentResponse.body.text).toBe(commentData.text);
    expect(commentResponse.body.caseId).toBe(testCase.id);
    expect(commentResponse.body.userId.toString()).toBe(testUser._id.toString());
    expect(commentResponse.body.userFirstName).toBe(testUser.firstName);
    expect(commentResponse.body.userLastName).toBe(testUser.lastName);

    // Step 3: Verify the comment appears when getting case comments
    const caseCommentsResponse = await request(app)
      .get(`/api/cases/${testCase.id}/comments`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(caseCommentsResponse.body)).toBe(true);
    expect(caseCommentsResponse.body.length).toBe(1);
    expect(caseCommentsResponse.body[0].text).toBe(commentData.text);
    expect(caseCommentsResponse.body[0].caseId).toBe(testCase.id);
    expect(caseCommentsResponse.body[0].userId.toString()).toBe(testUser._id.toString());

    // Step 4: Verify the case can still be retrieved and contains expected data
    const caseRetrievalResponse = await request(app)
      .get(`/api/cases/${testCase.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(caseRetrievalResponse.body.id).toBe(testCase.id);
    expect(caseRetrievalResponse.body.caseId).toBe(testCase.caseId);
    expect(caseRetrievalResponse.body.clientFullName).toBe(testCase.clientFullName);
  });


}); 