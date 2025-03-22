const express = require('express');
const { 
  createHackathon,
  getHackathons,
  getHackathon,
  updateHackathon,
  deleteHackathon,
  registerParticipant,
  getParticipants,
  getLeaderboard
} = require('../controllers/hackathon.controller');
const { 
  getSubmissions,
  getShortlisted
} = require('../controllers/submission.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', getHackathons);
router.get('/:id', getHackathon);

// Protected routes - any authenticated user
router.use(protect);
router.post('/:id/participants', registerParticipant);
router.get('/:id/leaderboard', getLeaderboard);

// Protected routes - teacher only
router.post('/', authorize('teacher'), createHackathon);
router.put('/:id', authorize('teacher'), updateHackathon);
router.delete('/:id', authorize('teacher'), deleteHackathon);
router.get('/:id/participants', authorize('teacher'), getParticipants);
router.get('/:id/submissions', authorize('teacher'), getSubmissions);
router.get('/:id/shortlisted', authorize('teacher'), getShortlisted);

module.exports = router; 