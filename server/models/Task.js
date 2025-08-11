const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Backlog', 'In Progress', 'Blocked', 'Complete'],
    default: 'Backlog'
  },
  caseId: {
    type: String,
    trim: true
  },
  caseName: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This automatically handles createdAt and updatedAt
});

// Pre-save middleware to ensure updatedAt is set
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware for findOneAndUpdate operations
taskSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Task', taskSchema);