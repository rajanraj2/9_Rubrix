const User = require('../models/user.model');

// Send token response with cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedToken();

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  // Set cookie and send response
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
};

// Register a student
exports.registerStudent = async (req, res) => {
  try {
    const { fullName, phoneNumber, schoolCollegeName, state, district, grade, gender, pin } = req.body;

    // Check if user already exists with the same phone number
    const existingUser = await User.findOne({ phoneNumber, role: 'student' });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A student with this phone number already exists',
      });
    }

    // Create student
    const student = await User.create({
      fullName,
      phoneNumber,
      role: 'student',
      schoolCollegeName,
      state,
      district,
      grade,
      gender,
      pin,
    });

    // Send token response with cookie
    sendTokenResponse(student, 201, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Register a teacher
exports.registerTeacher = async (req, res) => {
  try {
    const { fullName, phoneNumber, schoolName, gender, state, collegeNumber, pin } = req.body;

    // Check if user already exists with the same phone number
    const existingUser = await User.findOne({ phoneNumber, role: 'teacher' });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A teacher with this phone number already exists',
      });
    }

    // Create teacher
    const teacher = await User.create({
      fullName,
      phoneNumber,
      role: 'teacher',
      schoolName,
      gender,
      state,
      collegeNumber,
      pin,
    });

    // Send token response with cookie
    sendTokenResponse(teacher, 201, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { phoneNumber, pin, role } = req.body;

    // Validate inputs
    if (!phoneNumber || !pin || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone number, PIN, and role',
      });
    }

    // Check if user exists
    const user = await User.findOne({ phoneNumber, role }).select('+pin');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `This phone number is not registered as a ${role}. Please register first.`,
      });
    }

    // Check if PIN matches
    const isMatch = await user.comparePin(pin);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Send token response with cookie
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout user / clear cookie
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}; 