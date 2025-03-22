const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  parameterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Parameter ID is required'],
  },
  parameterName: {
    type: String,
    required: [true, 'Parameter name is required'],
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [10, 'Score cannot exceed 10'],
  },
  feedback: {
    type: String,
  },
});

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  hackathonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: [true, 'Hackathon ID is required'],
  },
  submissionText: {
    type: String,
    required: [true, 'Submission content is required'],
  },
  files: [{
    filename: String,
    path: String,
    mimetype: String,
  }],
  isShortlisted: {
    type: Boolean,
    default: false,
  },
  evaluation: [evaluationSchema],
  totalScore: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  evaluatedAt: {
    type: Date,
  },
});

// Compound index to ensure one submission per user per hackathon
submissionSchema.index({ userId: 1, hackathonId: 1 }, { unique: true });

// Virtual for user details
submissionSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Set virtuals to true when converting to JSON
submissionSchema.set('toJSON', { virtuals: true });
submissionSchema.set('toObject', { virtuals: true });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission; 