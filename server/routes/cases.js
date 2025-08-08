const express = require('express');
const Case = require('../models/Case');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const currentUserFullName = `${req.user.firstName} ${req.user.lastName}`;
    
    const cases = await Case.find({
      $or: [
        { createdBy: req.user._id },
        { assignedSocialWorkers: currentUserFullName }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ message: 'Failed to fetch cases' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const currentUserFullName = `${req.user.firstName} ${req.user.lastName}`;
    
    const caseData = await Case.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user._id },
        { assignedSocialWorkers: currentUserFullName }
      ]
    });
    
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    res.json(caseData);
  } catch (error) {
    console.error('Error fetching case:', error);
    res.status(500).json({ message: 'Failed to fetch case' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const caseData = new Case({
      ...req.body,
      createdBy: req.user._id
    });
    
    const savedCase = await caseData.save();
    res.status(201).json(savedCase);
  } catch (error) {
    console.error('Case creation error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Case ID already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create case',
      error: error.message 
    });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const currentUserFullName = `${req.user.firstName} ${req.user.lastName}`;
    
    const caseData = await Case.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user._id },
        { assignedSocialWorkers: currentUserFullName }
      ]
    });
    
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found or you do not have permission to edit it' });
    }
    
    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedCase);
  } catch (error) {
    console.error('Error updating case:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ message: 'Failed to update case' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedCase = await Case.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });
    
    if (!deletedCase) {
      return res.status(404).json({ message: 'Case not found or you do not have permission to delete it' });
    }
    
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({ message: 'Failed to delete case' });
  }
});

module.exports = router; 