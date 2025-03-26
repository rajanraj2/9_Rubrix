const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Parameter name is required'],
  },
  weight: {
    type: Number,
    required: [true, 'Parameter weight is required'],
    min: [0, 'Weight cannot be negative'],
    max: [100, 'Weight cannot exceed 100'],
  },
  description: {
    type: String,
    required: [true, 'Parameter description is required'],
  },
});

const eligibilityCriteriaSchema = new mongoose.Schema({
  criteriaType: {
    type: String,
    enum: ['grade', 'school', 'state', 'phoneNumbers', 'codeOnly'],
    required: [true, 'Criteria type is required'],
  },
  // For grade, school, state criteria
  values: {
    type: [String],
    default: [],
  },
  // For specific phone numbers
  phoneNumbers: {
    type: [String],
    default: [],
    validate: {
      validator: function(phoneNumbers) {
        // Only validate if criteriaType is phoneNumbers
        if (this.criteriaType === 'phoneNumbers') {
          return phoneNumbers.length > 0 && phoneNumbers.every(phone => /^\d{10}$/.test(phone));
        }
        return true;
      },
      message: 'Invalid phone number format. Must be 10 digits.'
    }
  }
});

const hackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Hackathon title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Hackathon description is required'],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  uniqueCode: {
    type: String,
    required: [true, 'Unique code is required'],
    trim: true,
    unique: true,
    maxlength: [6, 'Unique code cannot exceed 6 characters'],
    minlength: [6, 'Unique code must be 6 characters'],
  },
  parameters: {
    type: [parameterSchema],
    default: [{
      name: 'Impact on society',
      weight: 100,
      description: 'How impactful is this project for society?'
    }]
  },
  eligibilityCriteria: [eligibilityCriteriaSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who created the hackathon is required'],
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for status
hackathonSchema.virtual('status').get(function() {
  const now = new Date();
  if (now < this.startDate) {
    return 'upcoming';
  } else if (now > this.endDate) {
    return 'completed';
  } else {
    return 'ongoing';
  }
});

// Virtual for participant count
hackathonSchema.virtual('participantCount', {
  ref: 'Participant',
  localField: '_id',
  foreignField: 'hackathonId',
  count: true,
});

// Virtual for submission count
hackathonSchema.virtual('submissionCount', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'hackathonId',
  count: true,
});

// Set virtuals to true when converting to JSON
hackathonSchema.set('toJSON', { virtuals: true });
hackathonSchema.set('toObject', { virtuals: true });

const Hackathon = mongoose.model('Hackathon', hackathonSchema);

module.exports = Hackathon; 