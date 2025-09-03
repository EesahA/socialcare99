const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import the tasks routes
const tasksRoutes = require('../../routes/tasks');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/tasks', tasksRoutes);

describe('Task Management Routes', () => {
  let caregiverUser;
  let managerUser;
  let caregiverToken;
  let managerToken;
  let testTask;

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

  describe('POST /api/tasks', () => {
    test('should create task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        dueDate: '2025-12-31',
        priority: 'High',
        status: 'In Progress'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${caregiverToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.priority).toBe(taskData.priority);
      expect(response.body.status).toBe(taskData.status);
      expect(response.body.createdBy).toBe(caregiverUser.id);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    test('should return 400 for missing required fields', async () => {
      const taskData = {
        description: 'This is missing title and dueDate',
        priority: 'High'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${caregiverToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.message).toBe('Missing required fields');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      const Task = require('../../models/Task');
      
      // Task created by caregiver
      testTask = new Task({
        title: 'Caregiver Task',
        description: 'Task created by caregiver',
        dueDate: new Date('2025-12-31'),
        priority: 'Medium',
        status: 'Backlog',
        createdBy: caregiverUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await testTask.save();

      // Task created by manager
      const managerTask = new Task({
        title: 'Manager Task',
        description: 'Task created by manager',
        dueDate: new Date('2025-12-31'),
        priority: 'High',
        status: 'In Progress',
        createdBy: managerUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await managerTask.save();
    });

    test('should get all tasks as manager', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body.some(task => task.title === 'Caregiver Task')).toBe(true);
      expect(response.body.some(task => task.title === 'Manager Task')).toBe(true);
    });

    test('should get only own tasks as caregiver', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${caregiverToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Caregiver Task');
      expect(response.body[0].createdBy).toBe(caregiverUser.id);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    beforeEach(async () => {
      // Create a test task
      const Task = require('../../models/Task');
      testTask = new Task({
        title: 'Test Task',
        description: 'Task to update',
        dueDate: new Date('2025-12-31'),
        priority: 'Medium',
        status: 'Backlog',
        createdBy: caregiverUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await testTask.save();
    });

    test('should update task status as creator', async () => {
      const updateData = {
        status: 'In Progress',
        priority: 'High'
      };

      const response = await request(app)
        .put(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${caregiverToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('In Progress');
      expect(response.body.priority).toBe('High');
      expect(response.body.title).toBe('Test Task'); // Unchanged
      expect(response.body).toHaveProperty('updatedAt');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    beforeEach(async () => {
      // Create a test task
      const Task = require('../../models/Task');
      testTask = new Task({
        title: 'Test Task',
        description: 'Task to delete',
        dueDate: new Date('2025-12-31'),
        priority: 'Medium',
        status: 'Backlog',
        createdBy: caregiverUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await testTask.save();
    });

    test('should delete own task as creator', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${testTask.id}`)
        .set('Authorization', `Bearer ${caregiverToken}`)
        .expect(200);

      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task was actually deleted
      const Task = require('../../models/Task');
      const deletedTask = await Task.findById(testTask.id);
      expect(deletedTask).toBeNull();
    });

    test('should return 404 when caregiver tries to delete another user\'s task', async () => {
      // Create another task by manager
      const Task = require('../../models/Task');
      const managerTask = new Task({
        title: 'Manager Task',
        description: 'Task created by manager',
        dueDate: new Date('2025-12-31'),
        priority: 'High',
        status: 'In Progress',
        createdBy: managerUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await managerTask.save();

      const response = await request(app)
        .delete(`/api/tasks/${managerTask.id}`)
        .set('Authorization', `Bearer ${caregiverToken}`)
        .expect(404);

      expect(response.body.message).toBe('Task not found');
    });
  });
}); 