const express = require('express');
const { 
  createSubmission,
  getSubmission,
  updateSubmission,
  toggleShortlist
} = require('../controllers/submission.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all users
router.post('/', upload.array('files', 5), createSubmission);
router.get('/:id', getSubmission);

// Routes for teachers only
router.put('/:id', authorize('teacher'), updateSubmission);
router.post('/:id/shortlist', authorize('teacher'), toggleShortlist);

module.exports = router;
 