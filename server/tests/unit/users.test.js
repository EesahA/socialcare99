const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import the users routes
const usersRoutes = require('../../routes/users');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/users', usersRoutes);

describe('User Management Routes', () => {
  let testUser;
  let validToken;

  beforeEach(async () => {
    // Create a test user and generate token for each test
    const User = require('../../models/User');
    testUser = new User({
      email: 'testuser@example.gov.uk',
      password: await bcrypt.hash('TestPassword123!', 10),
      firstName: 'John',
      lastName: 'Doe',
      role: 'caregiver'
    });
    await testUser.save();

    // Generate valid JWT token
    const payload = {
      id: testUser.id,
      email: testUser.email,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      role: testUser.role
    };
    validToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
  });

  describe('GET /api/users/profile', () => {
    test('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
      expect(response.body.firstName).toBe(testUser.firstName);
      expect(response.body.lastName).toBe(testUser.lastName);
      expect(response.body.role).toBe(testUser.role);
      expect(response.body).not.toHaveProperty('password');
    });

    test('should return 401 when user not found', async () => {
      // Create a token with a non-existent user ID
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const payload = {
        id: nonExistentUserId,
        email: 'nonexistent@example.gov.uk',
        firstName: 'Non',
        lastName: 'Existent',
        role: 'caregiver'
      };
      const invalidToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.message).toBe('Token is not valid');
    });
  });

  describe('PUT /api/users/profile', () => {
    test('should update profile with valid data', async () => {
      const updateData = {
        name: 'Jane Smith',
        email: 'jane.smith@example.gov.uk',
        role: 'manager'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.firstName).toBe('Jane');
      expect(response.body.lastName).toBe('Smith');
      expect(response.body.email).toBe('jane.smith@example.gov.uk');
      expect(response.body.role).toBe('manager');
    });

    test('should return 400 for missing required fields', async () => {
      const updateData = {
        // Missing name and email
        role: 'manager'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.message).toBe('Name and email are required');
    });

    test('should return 400 for duplicate email', async () => {
      // Create another user with different email
      const User = require('../../models/User');
      const otherUser = new User({
        email: 'other@example.gov.uk',
        password: await bcrypt.hash('Password123!', 10),
        firstName: 'Other',
        lastName: 'User',
        role: 'caregiver'
      });
      await otherUser.save();

      const updateData = {
        name: 'John Doe',
        email: 'other@example.gov.uk' // Try to use existing email
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.message).toBe('Email is already in use');
    });
  });

  describe('PUT /api/users/change-password', () => {
    test('should change password with valid current password', async () => {
      const passwordData = {
        currentPassword: 'TestPassword123!',
        newPassword: 'NewPassword456!'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.message).toBe('Password changed successfully');

      // Verify password was actually changed
      const User = require('../../models/User');
      const updatedUser = await User.findById(testUser.id);
      expect(await bcrypt.compare('NewPassword456!', updatedUser.password)).toBe(true);
    });

    test('should return 400 for incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword456!'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${validToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.message).toBe('Current password is incorrect');
    });
  });
}); 