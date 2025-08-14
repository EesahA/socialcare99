const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  meetingType: {
    type: String,
    required: true,
    enum: ['Home Visit', 'Office Meeting', 'Phone Call', 'Virtual Meeting', 'School Meeting', 'Medical Appointment', 'Court Hearing', 'Other'],
    default: 'Home Visit'
  },
  location: {
    type: String,
    trim: true
  },
  attendees: {
    type: String,
    trim: true
  },
  caseId: {
    type: String,
    required: true,
    trim: true
  },
  caseName: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled'
  }
}, {
  timestamps: true
});

// Index for efficient querying by case
meetingSchema.index({ caseId: 1, scheduledAt: 1 });

module.exports = mongoose.model('Meeting', meetingSchema); 