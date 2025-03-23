const express = require('express');
const { 
  createSubmission,
  getSubmission,
  updateSubmission,
  toggleShortlist,
  getUserSubmissions,
  getFilePresignedUrl
} = require('../controllers/submission.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadToS3 } = require('../services/s3Service');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all users
router.post('/', uploadToS3.array('files', 5), createSubmission);
router.get('/my-submissions', getUserSubmissions);
router.get('/:id', getSubmission);
router.get('/:submissionId/file/:fileIndex/presigned-url', getFilePresignedUrl);

// Routes for teachers and admins only
router.use(authorize('teacher', 'admin'));
router.put('/:id', updateSubmission);
router.post('/:id/shortlist', toggleShortlist);

module.exports = router;
 