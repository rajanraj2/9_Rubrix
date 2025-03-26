const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
  },
  email: {
    type: String,
    required: function() { return this.role === 'teacher'; },
    unique: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      'Please provide a valid email',
    ],
  },
  phoneNumber: {
    type: String,
    required: function() { return this.role === 'student'; },
    unique: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits'],
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'pending', 'admin', 'superadmin'],
    default: 'student',
    required: [true, 'Please provide your role'],
  },
  // Student specific fields
  schoolCollegeName: {
    type: String,
    required: function() { return this.role === 'student'; },
    trim: true,
  },
  state: {
    type: String,
    required: function() { return this.role === 'student'; },
  },
  district: {
    type: String,
    required: function() { return this.role === 'student'; },
  },
  grade: {
    type: String,
    required: function() { return this.role === 'student'; },
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Please specify your gender'],
  },
  // Teacher specific fields
  schoolName: {
    type: String,
    required: function() { return this.role === 'teacher'; },
  },
  collegeNumber: {
    type: String,
    required: function() { return this.role === 'teacher'; },
  },
  // Auth
  pin: {
    type: String,
    required: [true, 'Please provide a 4-digit PIN'],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash PIN before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('pin')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare PIN method
userSchema.methods.comparePin = async function(enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

// Generate JWT token
userSchema.methods.getSignedToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User; 