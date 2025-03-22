const Hackathon = require('../models/hackathon.model');
const Participant = require('../models/participant.model');
const Submission = require('../models/submission.model');

// Create a new hackathon
exports.createHackathon = async (req, res) => {
  try {
    // Add user ID to request body
    req.body.createdBy = req.user.id;
    
    const hackathon = await Hackathon.create(req.body);

    res.status(201).json({
      success: true,
      data: hackathon,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all hackathons
exports.getHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find()
      .populate({
        path: 'createdBy',
        select: 'fullName schoolName',
      });

    // Get participant and submission counts for each hackathon
    const hackathonsWithCounts = await Promise.all(
      hackathons.map(async (hackathon) => {
        const participantCount = await Participant.countDocuments({ hackathonId: hackathon._id });
        const submissionCount = await Submission.countDocuments({ hackathonId: hackathon._id });
        
        return {
          ...hackathon.toObject(),
          participants: participantCount,
          submissions: submissionCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: hackathonsWithCounts.length,
      data: hackathonsWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single hackathon
exports.getHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate({
        path: 'createdBy',
        select: 'fullName schoolName',
      });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }

    // Get participant and submission counts
    const participantCount = await Participant.countDocuments({ hackathonId: hackathon._id });
    const submissionCount = await Submission.countDocuments({ hackathonId: hackathon._id });

    const hackathonWithCounts = {
      ...hackathon.toObject(),
      participants: participantCount,
      submissions: submissionCount,
    };

    res.status(200).json({
      success: true,
      data: hackathonWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update hackathon
exports.updateHackathon = async (req, res) => {
  try {
    let hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }

    // Make sure user is the hackathon creator
    if (hackathon.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this hackathon',
      });
    }

    hackathon = await Hackathon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: hackathon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete hackathon
exports.deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }

    // Make sure user is the hackathon creator
    if (hackathon.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this hackathon',
      });
    }

    await hackathon.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Register a participant for a hackathon
exports.registerParticipant = async (req, res) => {
  try {
    const { userId } = req.body;
    const hackathonId = req.params.id;
    
    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }

    // Check if user is already registered
    const existingParticipant = await Participant.findOne({ userId, hackathonId });
    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'User already registered for this hackathon',
      });
    }

    // Register participant
    const participant = await Participant.create({ userId, hackathonId });

    res.status(201).json({
      success: true,
      data: participant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get participants for a hackathon
exports.getParticipants = async (req, res) => {
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

    // Get participants
    const participants = await Participant.find({ hackathonId })
      .populate({
        path: 'userId',
        select: 'fullName phoneNumber state district grade gender',
      });

    res.status(200).json({
      success: true,
      count: participants.length,
      data: participants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get hackathon leaderboard
exports.getLeaderboard = async (req, res) => {
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

    // Get submissions with score, sorted by totalScore
    const submissions = await Submission.find({ hackathonId })
      .sort({ totalScore: -1 })
      .populate({
        path: 'userId',
        select: 'fullName state district grade',
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