const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import the cases routes
const casesRoutes = require('../../routes/cases');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/cases', casesRoutes);

describe('Case Management Routes', () => {
  let caregiverUser;
  let managerUser;
  let caregiverToken;
  let managerToken;
  let testCase;

  beforeEach(async () => {
    // Create test users for each test
    const User = require('../../models/User');
    
    // Create caregiver user
    caregiverUser = new User({
      email: 'caregiver@example.gov.uk',
      password: await bcrypt.hash('Password123!', 10),
      firstName: 'John',
      lastName: 'Caregiver',
      role: 'caregiver'
    });
    await caregiverUser.save();

    // Create manager user
    managerUser = new User({
      email: 'manager@example.gov.uk',
      password: await bcrypt.hash('Password123!', 10),
      firstName: 'Jane',
      lastName: 'Manager',
      role: 'manager'
    });
    await managerUser.save();

    // Generate tokens
    caregiverToken = jwt.sign(
      { id: caregiverUser.id, email: caregiverUser.email, role: caregiverUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    managerToken = jwt.sign(
      { id: managerUser.id, email: managerUser.email, role: managerUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  describe('POST /api/cases', () => {
    test('should create case with valid data', async () => {
      const caseData = {
        caseId: 'CASE001',
        clientFullName: 'John Smith',
        dateOfBirth: '1980-01-01',
        clientReferenceNumber: 'REF001',
        caseType: 'Support',
        caseStatus: 'Open'
      };

      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${caregiverToken}`)
        .send(caseData)
        .expect(201);

      expect(response.body.caseId).toBe(caseData.caseId);
      expect(response.body.clientFullName).toBe(caseData.clientFullName);
      expect(response.body.caseStatus).toBe(caseData.caseStatus);
      expect(response.body.createdBy).toBe(caregiverUser.id);
      expect(response.body).toHaveProperty('createdAt');
    });

    test('should return 400 for validation errors', async () => {
      const caseData = {
        // Missing required fields like caseId, clientFullName
        description: 'This case is missing required fields'
      };

      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${caregiverToken}`)
        .send(caseData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/cases', () => {
    beforeEach(async () => {
      // Create test cases
      const Case = require('../../models/Case');
      
      // Case created by caregiver
      testCase = new Case({
        caseId: 'CASE001',
        clientFullName: 'John Smith',
        dateOfBirth: '1980-01-01',
        clientReferenceNumber: 'REF001',
        caseType: 'Support',
        caseStatus: 'Open',
        createdBy: caregiverUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await testCase.save();

      // Case created by manager
      const managerCase = new Case({
        caseId: 'CASE002',
        clientFullName: 'Jane Doe',
        dateOfBirth: '1975-05-15',
        clientReferenceNumber: 'REF002',
        caseType: 'Assessment',
        caseStatus: 'Open',
        createdBy: managerUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await managerCase.save();
    });

    test('should get all cases as manager', async () => {
      const response = await request(app)
        .get('/api/cases')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.some(c => c.caseId === 'CASE001')).toBe(true);
      expect(response.body.some(c => c.caseId === 'CASE002')).toBe(true);
    });

    test('should get only assigned/created cases as caregiver', async () => {
      const response = await request(app)
        .get('/api/cases')
        .set('Authorization', `Bearer ${caregiverToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].caseId).toBe('CASE001');
      expect(response.body[0].createdBy).toBe(caregiverUser.id);
    });
  });

  describe('PUT /api/cases/:id', () => {
    beforeEach(async () => {
      // Create a test case
      const Case = require('../../models/Case');
      testCase = new Case({
        caseId: 'CASE001',
        clientFullName: 'John Smith',
        dateOfBirth: '1980-01-01',
        clientReferenceNumber: 'REF001',
        caseType: 'Support',
        caseStatus: 'Open',
        createdBy: caregiverUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await testCase.save();
    });

    test('should update case status as authorized user', async () => {
      const updateData = {
        caseStatus: 'Ongoing',
        priorityLevel: 'High'
      };

      const response = await request(app)
        .put(`/api/cases/${testCase.id}`)
        .set('Authorization', `Bearer ${caregiverToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.caseStatus).toBe('Ongoing');
      expect(response.body.priorityLevel).toBe('High');
      expect(response.body.caseId).toBe('CASE001'); // Unchanged
      expect(response.body).toHaveProperty('updatedAt');
    });
  });

  describe('Case Archive/Complete', () => {
    beforeEach(async () => {
      // Create a test case
      const Case = require('../../models/Case');
      testCase = new Case({
        caseId: 'CASE001',
        clientFullName: 'John Smith',
        dateOfBirth: '1980-01-01',
        clientReferenceNumber: 'REF001',
        caseType: 'Support',
        caseStatus: 'Open',
        createdBy: caregiverUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await testCase.save();
    });

    test('should archive case successfully', async () => {
      const response = await request(app)
        .patch(`/api/cases/${testCase.id}/archive`)
        .set('Authorization', `Bearer ${caregiverToken}`)
        .expect(200);

      expect(response.body.archived).toBe(true);
      expect(response.body).toHaveProperty('archivedAt');
      expect(response.body.archivedBy).toBe(caregiverUser.id);
    });

    test('should unarchive case successfully', async () => {
      // First archive the case
      await request(app)
        .patch(`/api/cases/${testCase.id}/archive`)
        .set('Authorization', `Bearer ${caregiverToken}`);

      // Then unarchive it
      const response = await request(app)
        .patch(`/api/cases/${testCase.id}/unarchive`)
        .set('Authorization', `Bearer ${caregiverToken}`)
        .expect(200);

      expect(response.body.archived).toBe(false);
      expect(response.body.archivedAt).toBeNull();
      expect(response.body.archivedBy).toBeNull();
    });
  });
}); 