const Submission = require('../models/submission.model');
const Hackathon = require('../models/hackathon.model');
const Participant = require('../models/participant.model');

// Create a submission
exports.createSubmission = async (req, res) => {
  try {
    const { hackathonId, submissionText } = req.body;
    const userId = req.user.id;
    
    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }
    
    // Check if hackathon is still ongoing
    const now = new Date();
    if (now > hackathon.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Hackathon has already ended',
      });
    }
    
    // Check if user is a participant
    const participant = await Participant.findOne({ userId, hackathonId });
    if (!participant) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this hackathon',
      });
    }
    
    // Check if user has already submitted
    const existingSubmission = await Submission.findOne({ userId, hackathonId });
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted for this hackathon',
      });
    }
    
    // Process uploaded files
    const files = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
    })) : [];
    
    // Create submission
    const submission = await Submission.create({
      userId,
      hackathonId,
      submissionText,
      files,
    });
    
    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all submissions for a hackathon
exports.getSubmissions = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    
    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }
    
    // Check if user is the hackathon creator
    if (hackathon.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view submissions',
      });
    }
    
    // Get submissions
    const submissions = await Submission.find({ hackathonId })
      .populate({
        path: 'userId',
        select: 'fullName phoneNumber state district grade gender',
      });
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single submission
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate({
        path: 'userId',
        select: 'fullName phoneNumber state district grade gender',
      })
      .populate({
        path: 'hackathonId',
        select: 'title description startDate endDate parameters',
      });
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }
    
    // Check if user is authorized to view submission
    // Allow if user is submission creator, hackathon creator, or admin
    const hackathon = await Hackathon.findById(submission.hackathonId);
    if (
      submission.userId._id.toString() !== req.user.id &&
      hackathon.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission',
      });
    }
    
    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a submission (evaluation)
exports.updateSubmission = async (req, res) => {
  try {
    const { evaluation, feedback } = req.body;
    
    let submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }
    
    // Check if user is authorized to evaluate
    const hackathon = await Hackathon.findById(submission.hackathonId);
    if (hackathon.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to evaluate this submission',
      });
    }
    
    // Calculate total score if evaluation is provided
    let totalScore = 0;
    if (evaluation && evaluation.length > 0) {
      // Get hackathon parameters
      const hackathon = await Hackathon.findById(submission.hackathonId);
      
      // Calculate weighted score
      totalScore = evaluation.reduce((sum, eval) => {
        const parameter = hackathon.parameters.find(
          (p) => p._id.toString() === eval.parameterId.toString()
        );
        if (parameter) {
          return sum + (eval.score * (parameter.weight / 100));
        }
        return sum;
      }, 0);
    }
    
    // Update submission
    submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { 
        evaluation, 
        feedback, 
        totalScore,
        evaluatedAt: new Date() 
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle shortlist status
exports.toggleShortlist = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }
    
    // Check if user is authorized to shortlist
    const hackathon = await Hackathon.findById(submission.hackathonId);
    if (hackathon.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to shortlist submissions',
      });
    }
    
    // Toggle shortlist status
    submission.isShortlisted = !submission.isShortlisted;
    await submission.save();
    
    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get shortlisted submissions
exports.getShortlisted = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    
    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }
    
    // Check if user is the hackathon creator
    if (hackathon.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view shortlisted submissions',
      });
    }
    
    // Get shortlisted submissions
    const submissions = await Submission.find({
      hackathonId,
      isShortlisted: true,
    }).populate({
      path: 'userId',
      select: 'fullName phoneNumber state district grade gender',
    });
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}; 