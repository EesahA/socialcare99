const express = require('express');
const Client = require('../models/Client');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all clients
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.find().populate('assignedCaregivers', 'firstName lastName email');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single client
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('assignedCaregivers', 'firstName lastName email');
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create client
router.post('/', auth, async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update client
router.put('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete client
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 