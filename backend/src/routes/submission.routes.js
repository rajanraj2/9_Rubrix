const express = require('express');
const { 
  createSubmission,
  getSubmission,
  updateSubmission,
  toggleShortlist
} = require('../controllers/submission.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all users
router.post('/', createSubmission);
router.get('/:id', getSubmission);

// Routes for teachers only
router.put('/:id', authorize('teacher'), updateSubmission);
router.post('/:id/shortlist', authorize('teacher'), toggleShortlist);

module.exports = router;
 