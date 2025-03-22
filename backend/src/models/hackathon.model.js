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
  parameters: [parameterSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who created the hackathon is required'],
  },
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