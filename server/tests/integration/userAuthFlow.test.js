const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Import the main app components
const authRoutes = require('../../routes/auth');
const usersRoutes = require('../../routes/users');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

describe('User Authentication Flow Integration', () => {
  let testUserData;
  let authToken;

  beforeEach(async () => {
    // Clear any existing data
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }

    // Test user data
    testUserData = {
      email: 'integration@example.gov.uk',
      password: 'IntegrationPassword123!',
      firstName: 'Integration',
      lastName: 'TestUser'
    };
  });

  test('User registration → login → get profile', async () => {
    // Step 1: Register a new user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUserData)
      .expect(201);

    expect(registerResponse.body).toHaveProperty('token');
    expect(registerResponse.body).toHaveProperty('user');
    expect(registerResponse.body.user.email).toBe(testUserData.email);
    expect(registerResponse.body.user.firstName).toBe(testUserData.firstName);
    expect(registerResponse.body.user.lastName).toBe(testUserData.lastName);
    expect(registerResponse.body.user.role).toBe('caregiver');

    // Store the token for the next step
    authToken = registerResponse.body.token;

    // Step 2: Login with the registered user
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUserData.email,
        password: testUserData.password
      })
      .expect(200);

    expect(loginResponse.body).toHaveProperty('token');
    expect(loginResponse.body).toHaveProperty('user');
    expect(loginResponse.body.user.email).toBe(testUserData.email);
    expect(loginResponse.body.user.firstName).toBe(testUserData.firstName);
    expect(loginResponse.body.user.lastName).toBe(testUserData.lastName);

    // Step 3: Use the token to get the user profile
    const profileResponse = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(profileResponse.body.email).toBe(testUserData.email);
    expect(profileResponse.body.firstName).toBe(testUserData.firstName);
    expect(profileResponse.body.lastName).toBe(testUserData.lastName);
    expect(profileResponse.body.role).toBe('caregiver');
    expect(profileResponse.body).not.toHaveProperty('password');

    // Verify the user data is consistent across all three steps
    expect(profileResponse.body.email).toBe(registerResponse.body.user.email);
    expect(profileResponse.body.firstName).toBe(registerResponse.body.user.firstName);
    expect(profileResponse.body.lastName).toBe(registerResponse.body.user.lastName);
    expect(profileResponse.body.role).toBe(registerResponse.body.user.role);
  });
}); 