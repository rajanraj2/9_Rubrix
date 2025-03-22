const express = require('express');
const { 
  registerStudent, 
  registerTeacher, 
  login, 
  getMe,
  logout
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register/student', registerStudent);
router.post('/register/teacher', registerTeacher);
router.post('/login', login);
router.get('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router; 