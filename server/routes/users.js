const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('firstName lastName email role')
      .sort({ firstName: 1, lastName: 1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router; 