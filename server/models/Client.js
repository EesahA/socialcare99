const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  contactInfo: {
    phone: String,
    email: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  carePlan: {
    type: String,
    required: true
  },
  medicalInfo: {
    conditions: [String],
    medications: [String],
    allergies: [String]
  },
  assignedCaregivers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', clientSchema); 