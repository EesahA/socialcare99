const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Import the main app components
const authRoutes = require('../../routes/auth');
const casesRoutes = require('../../routes/cases');
const tasksRoutes = require('../../routes/tasks');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/tasks', tasksRoutes);

describe('Task-Case Integration', () => {
  let testUser;
  let authToken;
  let testCase;
  let testTask;

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

  test('Create case → create task for that case → verify task appears in case', async () => {
    // Step 1: Create a new case
    const caseData = {
      caseId: 'INTEGRATION001',
      clientFullName: 'John Smith',
      dateOfBirth: '1980-01-01',
      clientReferenceNumber: 'REF001',
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
    expect(caseResponse.body.caseStatus).toBe(caseData.caseStatus);
    expect(caseResponse.body.createdBy).toBe(testUser.id);

    testCase = caseResponse.body;

    // Step 2: Create a task for that case
    const taskData = {
      title: 'Integration Test Task',
      description: 'This task is linked to the integration test case',
      dueDate: '2025-12-31',
      priority: 'High',
      status: 'Backlog',
      caseId: testCase.id,
      caseName: testCase.clientFullName
    };

    const taskResponse = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(taskData)
      .expect(201);

    expect(taskResponse.body.title).toBe(taskData.title);
    expect(taskResponse.body.caseId).toBe(testCase.id);
    expect(taskResponse.body.caseName).toBe(testCase.clientFullName);
    expect(taskResponse.body.createdBy).toBe(testUser.id);

    testTask = taskResponse.body;

    // Step 3: Verify the task appears when getting tasks for the user
    const tasksResponse = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(tasksResponse.body)).toBe(true);
    expect(tasksResponse.body.length).toBe(1);
    expect(tasksResponse.body[0].id).toBe(testTask.id);
    expect(tasksResponse.body[0].title).toBe(testTask.title);
    expect(tasksResponse.body[0].caseId).toBe(testCase.id);
    expect(tasksResponse.body[0].caseName).toBe(testCase.clientFullName);

    // Step 4: Verify the case can still be retrieved and contains expected data
    const caseRetrievalResponse = await request(app)
      .get(`/api/cases/${testCase.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(caseRetrievalResponse.body.id).toBe(testCase.id);
    expect(caseRetrievalResponse.body.caseId).toBe(testCase.caseId);
    expect(caseRetrievalResponse.body.clientFullName).toBe(testCase.clientFullName);

    // Step 5: Verify the relationship integrity - task references the correct case
    expect(testTask.caseId).toBe(testCase.id);
    expect(testTask.caseName).toBe(testCase.clientFullName);
    expect(testTask.createdBy).toBe(testCase.createdBy);
  });
}); 