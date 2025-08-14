const express = require('express');
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all meetings for a specific case
router.get('/case/:caseId', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({ 
      caseId: req.params.caseId,
      createdBy: req.user.id 
    }).sort({ scheduledAt: 1 });
    
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
});

// Get all meetings for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({ createdBy: req.user.id })
      .sort({ scheduledAt: 1 });
    
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
});

// Create a new meeting
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, scheduledAt, duration, meetingType, location, attendees, caseId, caseName } = req.body;

    if (!title || !scheduledAt || !caseId || !caseName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const meeting = new Meeting({
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      meetingType: meetingType || 'Home Visit',
      location,
      attendees,
      caseId,
      caseName,
      createdBy: req.user.id
    });

    const savedMeeting = await meeting.save();
    res.status(201).json(savedMeeting);
  } catch (error) {
    console.error('Error creating meeting:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: 'Failed to create meeting' });
  }
});

// Update a meeting
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    if (req.body.scheduledAt) {
      updateData.scheduledAt = new Date(req.body.scheduledAt);
    }

    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json(meeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ message: 'Failed to update meeting' });
  }
});

// Delete a meeting
router.delete('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user.id 
    });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ message: 'Failed to delete meeting' });
  }
});

module.exports = router; 