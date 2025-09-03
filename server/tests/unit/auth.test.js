const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import the auth routes
const authRoutes = require('../../routes/auth');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Routes', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user with valid data', async () => {
      const userData = {
        email: 'test@example.gov.uk',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
      expect(response.body.user.lastName).toBe(userData.lastName);
      expect(response.body.user.role).toBe('caregiver'); // Should always be caregiver
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should return 500 for missing required fields', async () => {
      const incompleteData = {
        email: 'incomplete@example.gov.uk',
        // Missing password, firstName, lastName
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(500);

      expect(response.body.message).toBe('Server error');
    });

    test('should hash password correctly', async () => {
      const userData = {
        email: 'passwordtest@example.gov.uk',
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Check if password was hashed in database
      const User = require('../../models/User');
      const savedUser = await User.findOne({ email: userData.email });
      
      expect(savedUser.password).not.toBe(userData.password);
      expect(await bcrypt.compare(userData.password, savedUser.password)).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user for login tests
      const User = require('../../models/User');
      testUser = new User({
        email: 'logintest@example.gov.uk',
        password: await bcrypt.hash('TestPassword123!', 10),
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver'
      });
      await testUser.save();
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'logintest@example.gov.uk',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should return 400 for invalid password', async () => {
      const loginData = {
        email: 'logintest@example.gov.uk',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should return 500 for missing credentials', async () => {
      const loginData = {
        email: 'logintest@example.gov.uk'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(500);

      expect(response.body.message).toBe('Server error');
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser;
    let validToken;

    beforeEach(async () => {
      // Create a test user and generate token
      const User = require('../../models/User');
      testUser = new User({
        email: 'metest@example.gov.uk',
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

    test('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
      expect(response.body.firstName).toBe(testUser.firstName);
      expect(response.body.lastName).toBe(testUser.lastName);
      expect(response.body.role).toBe(testUser.role);
      expect(response.body).not.toHaveProperty('password');
    });

    test('should return 401 for invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.message).toBe('Token is not valid');
    });
  });

  describe('Password Hashing', () => {
    test('should verify bcrypt is working correctly', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // Verify hash is different from plain text
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(plainPassword.length);

      // Verify password comparison works
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);

      // Verify wrong password fails
      const wrongMatch = await bcrypt.compare('WrongPassword', hashedPassword);
      expect(wrongMatch).toBe(false);
    });
  });
}); 