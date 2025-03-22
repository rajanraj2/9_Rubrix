const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
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
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure uniqueness
participantSchema.index({ userId: 1, hackathonId: 1 }, { unique: true });

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant; 