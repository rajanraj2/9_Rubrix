const express = require('express');
const { 
  createHackathon,
  getHackathons,
  getHackathon,
  updateHackathon,
  deleteHackathon,
  registerParticipant,
  getParticipants,
  getLeaderboard,
  addCollaborators,
  getCompletedHackathons,
  joinByCode
} = require('../controllers/hackathon.controller');
const { 
  getSubmissions,
  getShortlisted,
  removeShortlisted

} = require('../controllers/submission.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes - No need for public routes anymore
// All routes should be protected

// Protected routes - any authenticated user
router.use(protect);
router.get('/', getHackathons);
router.get('/completed', getCompletedHackathons);
router.get('/:id', getHackathon);
router.post('/join-by-code', joinByCode);
router.post('/:id/participants', registerParticipant);
router.get('/:id/leaderboard', getLeaderboard);

// Protected routes - teacher only
router.post('/', authorize('teacher'), createHackathon);
router.put('/:id', authorize('teacher'), updateHackathon);
router.delete('/:id', authorize('teacher'), deleteHackathon);
router.post('/:id/collaborators', authorize('teacher'), addCollaborators);
router.get('/:id/participants', authorize('teacher'), getParticipants);
router.get('/:id/submissions', authorize('teacher'), getSubmissions);
router.get('/:id/shortlisted', authorize('teacher'), getShortlisted);

router.post('/hackathons/remove-shortlisted/:id', removeShortlisted)


module.exports = router; 