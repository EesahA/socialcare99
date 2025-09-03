const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import the case comments routes
const caseCommentsRoutes = require('../../routes/caseComments');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api', caseCommentsRoutes);

describe('Case Comments Routes', () => {
  let testUser;
  let testToken;
  let testCase;
  let testComment;

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

    // Create a test case
    const Case = require('../../models/Case');
    testCase = new Case({
      caseId: 'CASE001',
      clientFullName: 'John Smith',
      dateOfBirth: '1980-01-01',
      clientReferenceNumber: 'REF001',
      caseType: 'Support',
      caseStatus: 'Open',
      createdBy: testUser.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await testCase.save();
  });

  describe('POST /api/cases/:caseId/comments', () => {
    test('should create comment on case with valid text', async () => {
      const commentData = {
        text: 'This is a test comment on the case'
      };

      const response = await request(app)
        .post(`/api/cases/${testCase.id}/comments`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body.text).toBe(commentData.text);
      expect(response.body.caseId).toBe(testCase.id);
      expect(response.body.userId).toBe(testUser.id);
      expect(response.body.userFirstName).toBe(testUser.firstName);
      expect(response.body.userLastName).toBe(testUser.lastName);
      expect(response.body).toHaveProperty('createdAt');
    });

    test('should return 400 for missing/empty comment text', async () => {
      const commentData = {
        text: '' // Empty text
      };

      const response = await request(app)
        .post(`/api/cases/${testCase.id}/comments`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(commentData)
        .expect(400);

      expect(response.body.message).toBe('Comment text is required');
    });
  });

  describe('GET /api/cases/:caseId/comments', () => {
    beforeEach(async () => {
      // Create test comments
      const CaseComment = require('../../models/CaseComment');
      
      const comment1 = new CaseComment({
        caseId: testCase.id,
        userId: testUser.id,
        userFirstName: testUser.firstName,
        userLastName: testUser.lastName,
        text: 'First comment on the case'
      });
      await comment1.save();

      const comment2 = new CaseComment({
        caseId: testCase.id,
        userId: testUser.id,
        userFirstName: testUser.firstName,
        userLastName: testUser.lastName,
        text: 'Second comment on the case'
      });
      await comment2.save();
    });

    test('should get comments for a specific case', async () => {
      const response = await request(app)
        .get(`/api/cases/${testCase.id}/comments`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.some(c => c.text === 'First comment on the case')).toBe(true);
      expect(response.body.some(c => c.text === 'Second comment on the case')).toBe(true);
      expect(response.body[0].caseId).toBe(testCase.id);
    });
  });

  describe('DELETE /api/case-comments/:commentId', () => {
    beforeEach(async () => {
      // Create a test comment
      const CaseComment = require('../../models/CaseComment');
      testComment = new CaseComment({
        caseId: testCase.id,
        userId: testUser.id,
        userFirstName: testUser.firstName,
        userLastName: testUser.lastName,
        text: 'Comment to delete'
      });
      await testComment.save();
    });

    test('should delete own comment successfully', async () => {
      const response = await request(app)
        .delete(`/api/case-comments/${testComment.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.message).toBe('Comment deleted successfully');

      // Verify comment was actually deleted
      const CaseComment = require('../../models/CaseComment');
      const deletedComment = await CaseComment.findById(testComment.id);
      expect(deletedComment).toBeNull();
    });
  });
}); 