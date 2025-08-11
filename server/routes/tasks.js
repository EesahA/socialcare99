const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority, status, caseId, caseName } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      dueDate: new Date(dueDate),
      priority: priority || 'Medium',
      status: status || 'Backlog',
      caseId,
      caseName,
      createdBy: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

module.exports = router; 