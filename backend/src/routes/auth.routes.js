const express = require('express');
const { 
  registerStudent, 
  registerTeacher, 
  login, 
  getMe,
  logout
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {pendingTeacherApproval} = require('../middleware/pendingApprovalMiddleware');
const { verifyAuthCode, sendAuthCode } = require("../controllers/emailServiceController");
const {isApprovedTeacher} = require("../middleware/isApprovedTeacher");


const router = express.Router();

// Public routes
router.post('/register/student', registerStudent);

router.post('/register/teacher', pendingTeacherApproval);

router.post('/login', login);
router.get('/logout', logout);

// send-authentication-email to teacher
router.post("/teacher/send-verification-code", sendAuthCode);

// verify email
router.post("/teacher/verify-email", verifyAuthCode);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router; 