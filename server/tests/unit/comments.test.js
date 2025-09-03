const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import the comments routes
const commentsRoutes = require('../../routes/comments');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api', commentsRoutes);

describe('Task Comments Routes', () => {
  let testUser;
  let testToken;
  let testTask;
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

    // Create a test task
    const Task = require('../../models/Task');
    testTask = new Task({
      title: 'Test Task',
      description: 'Task for testing comments',
      dueDate: new Date('2025-12-31'),
      priority: 'Medium',
      status: 'Backlog',
      createdBy: testUser.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await testTask.save();
  });

  describe('POST /api/tasks/:taskId/comments', () => {
    test('should create comment on task with valid text', async () => {
      const commentData = {
        text: 'This is a test comment on the task'
      };

      const response = await request(app)
        .post(`/api/tasks/${testTask.id}/comments`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body.text).toBe(commentData.text);
      expect(response.body.taskId).toBe(testTask.id);
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
        .post(`/api/tasks/${testTask.id}/comments`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(commentData)
        .expect(400);

      expect(response.body.message).toBe('Comment text is required');
    });
  });

  describe('GET /api/tasks/:taskId/comments', () => {
    beforeEach(async () => {
      // Create test comments
      const Comment = require('../../models/Comment');
      
      const comment1 = new Comment({
        taskId: testTask.id,
        userId: testUser.id,
        userFirstName: testUser.firstName,
        userLastName: testUser.lastName,
        text: 'First comment on the task'
      });
      await comment1.save();

      const comment2 = new Comment({
        taskId: testTask.id,
        userId: testUser.id,
        userFirstName: testUser.firstName,
        userLastName: testUser.lastName,
        text: 'Second comment on the task'
      });
      await comment2.save();
    });

    test('should get comments for a specific task', async () => {
      const response = await request(app)
        .get(`/api/tasks/${testTask.id}/comments`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.some(c => c.text === 'First comment on the task')).toBe(true);
      expect(response.body.some(c => c.text === 'Second comment on the task')).toBe(true);
      expect(response.body[0].taskId).toBe(testTask.id);
    });
  });

  describe('DELETE /api/comments/:commentId', () => {
    beforeEach(async () => {
      // Create a test comment
      const Comment = require('../../models/Comment');
      testComment = new Comment({
        taskId: testTask.id,
        userId: testUser.id,
        userFirstName: testUser.firstName,
        userLastName: testUser.lastName,
        text: 'Comment to delete'
      });
      await testComment.save();
    });

    test('should delete own comment successfully', async () => {
      const response = await request(app)
        .delete(`/api/comments/${testComment.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.message).toBe('Comment deleted successfully');

      // Verify comment was actually deleted
      const Comment = require('../../models/Comment');
      const deletedComment = await Comment.findById(testComment.id);
      expect(deletedComment).toBeNull();
    });
  });
}); 