const express = require('express');
const { 
  generateInsights,
  generateLeaderboard,
  generateClusters,
  shortlistStudents,
  getShortlistedStudents
} = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes are protected and limited to teachers/admins
router.use(protect);
router.use(authorize('teacher', 'admin'));

// Analytics endpoints
router.get('/insights/:hackathonId', generateInsights);
router.get('/leaderboard/:hackathonId', generateLeaderboard);
router.get('/shortlisted/:hackathonId', getShortlistedStudents);
router.post('/clusters/:hackathonId', generateClusters);
router.post('/shortlist/:hackathonId', shortlistStudents);

module.exports = router; 