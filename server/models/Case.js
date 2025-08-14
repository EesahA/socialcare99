const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true,
    unique: true
  },
  clientFullName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  clientReferenceNumber: {
    type: String,
    required: true,
    trim: true
  },
  caseType: {
    type: String,
    required: true,
    trim: true
  },
  otherCaseType: {
    type: String,
    trim: true
  },
  caseStatus: {
    type: String,
    enum: ['Open', 'Ongoing', 'Closed', 'On Hold'],
    default: 'Open'
  },
  priorityLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  assignedSocialWorkers: [{
    type: String,
    trim: true
  }],
  clientAddress: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  emailAddress: {
    type: String,
    trim: true
  },
  livingSituation: {
    type: String,
    enum: ['Alone', 'With Family', 'Foster Care', 'Residential Home', 'Homeless']
  },
  safeguardingConcerns: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  safeguardingDetails: {
    type: String,
    trim: true
  },
  meetingDate: {
    type: Date
  },
  attendees: {
    type: String,
    trim: true
  },
  typeOfInteraction: {
    type: String,
    enum: ['Home Visit', 'Office Meeting', 'Phone Call', 'Virtual Meeting']
  },
  meetingSummary: {
    type: String,
    trim: true
  },
  concernsRaised: {
    type: String,
    trim: true
  },
  immediateActionsTaken: {
    type: String,
    trim: true
  },
  clientWishesFeelings: {
    type: String,
    trim: true
  },
  newTasks: [{
    type: String,
    trim: true
  }],
  nextPlannedReviewDate: {
    type: Date
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  archived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

caseSchema.virtual('creatorInfo', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

caseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Case', caseSchema); 