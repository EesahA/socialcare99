const express = require('express');
const Case = require('../models/Case');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
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

// Delete case (only for creator)
router.delete('/:id', auth, async (req, res) => {
  try {
    const caseData = await Case.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found or you do not have permission to delete it' });
    }
    
    await Case.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({ message: 'Failed to delete case' });
  }
});

// Add file upload route
router.post('/:id/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

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

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    caseData.attachments.push(attachment);
    await caseData.save();

    res.json({ message: 'File uploaded successfully', attachment });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// Download attachment
router.get('/:id/attachments/:filename', auth, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const attachment = caseData.attachments.find(att => att.filename === req.params.filename);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, attachment.originalName);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ message: 'Failed to download attachment' });
  }
});

// Delete attachment
router.delete('/:id/attachments/:filename', auth, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const attachmentIndex = caseData.attachments.findIndex(att => att.filename === req.params.filename);
    if (attachmentIndex === -1) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const attachment = caseData.attachments[attachmentIndex];
    
    // Check if user can delete (creator or uploader)
    if (caseData.createdBy.toString() !== req.user._id.toString() && 
        attachment.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to delete this attachment' });
    }

    // Remove file from disk
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from database
    caseData.attachments.splice(attachmentIndex, 1);
    await caseData.save();

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ message: 'Failed to delete attachment' });
  }
});

module.exports = router; 