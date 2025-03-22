const Hackathon = require('../models/hackathon.model');
const Participant = require('../models/participant.model');
const Submission = require('../models/submission.model');
const User = require('../models/user.model');

// Create a new hackathon
exports.createHackathon = async (req, res) => {
  try {
    // Add user ID to request body
    req.body.createdBy = req.user.id;
    
    // Create hackathon
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
    // Filter options based on user role
    let filter = {};
    
    if (req.user.role === 'student') {
      // Get all hackathons that match the student's eligibility
      const student = await User.findById(req.user.id);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      }

      // Find hackathons where student matches eligibility criteria
      const allHackathons = await Hackathon.find();
      const eligibleHackathonIds = [];
      
      for (const hackathon of allHackathons) {
        let isEligible = true;
        
        // If no criteria, everyone is eligible
        if (!hackathon.eligibilityCriteria || hackathon.eligibilityCriteria.length === 0) {
          eligibleHackathonIds.push(hackathon._id);
          continue;
        }
        
        // Check each criteria
        for (const criteria of hackathon.eligibilityCriteria) {
          if (criteria.criteriaType === 'grade' && criteria.values.length > 0) {
            if (!criteria.values.includes(student.grade)) {
              isEligible = false;
              break;
            }
          } else if (criteria.criteriaType === 'school' && criteria.values.length > 0) {
            if (!criteria.values.includes(student.schoolCollegeName)) {
              isEligible = false;
              break;
            }
          } else if (criteria.criteriaType === 'state' && criteria.values.length > 0) {
            if (!criteria.values.includes(student.state)) {
              isEligible = false;
              break;
            }
          } else if (criteria.criteriaType === 'phoneNumbers' && criteria.phoneNumbers.length > 0) {
            if (!criteria.phoneNumbers.includes(student.phoneNumber)) {
              isEligible = false;
              break;
            }
          }
        }
        
        if (isEligible) {
          eligibleHackathonIds.push(hackathon._id);
        }
      }
      
      filter = { _id: { $in: eligibleHackathonIds } };
    } else if (req.user.role === 'teacher') {
      // For teachers, show hackathons they created or are collaborators on
      filter = {
        $or: [
          { createdBy: req.user.id },
          { collaborators: req.user.id }
        ]
      };
    }

    const hackathons = await Hackathon.find(filter)
      .populate({
        path: 'createdBy',
        select: 'fullName schoolName',
      })
      .populate({
        path: 'collaborators',
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
      })
      .populate({
        path: 'collaborators',
        select: 'fullName schoolName',
      });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }

    // Check if student is eligible for this hackathon
    if (req.user.role === 'student') {
      const student = await User.findById(req.user.id);
      let isEligible = true;
      
      // If hackathon has eligibility criteria, check if student meets them
      if (hackathon.eligibilityCriteria && hackathon.eligibilityCriteria.length > 0) {
        isEligible = false; // Default to not eligible until we confirm they meet criteria
        
        for (const criteria of hackathon.eligibilityCriteria) {
          if (criteria.criteriaType === 'grade' && criteria.values.length > 0) {
            if (criteria.values.includes(student.grade)) {
              isEligible = true;
              break;
            }
          } else if (criteria.criteriaType === 'school' && criteria.values.length > 0) {
            if (criteria.values.includes(student.schoolCollegeName)) {
              isEligible = true;
              break;
            }
          } else if (criteria.criteriaType === 'state' && criteria.values.length > 0) {
            if (criteria.values.includes(student.state)) {
              isEligible = true;
              break;
            }
          } else if (criteria.criteriaType === 'phoneNumbers' && criteria.phoneNumbers.length > 0) {
            if (criteria.phoneNumbers.includes(student.phoneNumber)) {
              isEligible = true;
              break;
            }
          }
        }
      }
      
      // Check if hackathon is complete and student participated
      const isParticipant = await Participant.findOne({ 
        hackathonId: hackathon._id, 
        userId: req.user.id 
      });
      
      const now = new Date();
      const isCompleted = now > hackathon.endDate;
      
      // Student can access if they're eligible, or if the hackathon is complete and they participated
      if (!isEligible && !(isCompleted && isParticipant)) {
        return res.status(403).json({
          success: false,
          message: 'You are not eligible for this hackathon',
        });
      }
    } else if (req.user.role === 'teacher') {
      // Check if teacher is creator or collaborator
      const isCreator = hackathon.createdBy.toString() === req.user.id;
      const isCollaborator = hackathon.collaborators.some(
        collaborator => collaborator._id.toString() === req.user.id
      );
      
      if (!isCreator && !isCollaborator) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this hackathon',
        });
      }
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

// Add collaborators to a hackathon
exports.addCollaborators = async (req, res) => {
  try {
    const { collaboratorPhoneNumbers } = req.body;
    const hackathonId = req.params.id;
    
    if (!collaboratorPhoneNumbers || !Array.isArray(collaboratorPhoneNumbers) || collaboratorPhoneNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one collaborator phone number',
      });
    }
    
    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }
    
    // Make sure user is the hackathon creator
    if (hackathon.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add collaborators to this hackathon',
      });
    }
    
    // Find teacher users by phone numbers
    const teachers = await User.find({
      phoneNumber: { $in: collaboratorPhoneNumbers },
      role: 'teacher'
    });
    
    if (teachers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No teachers found with the provided phone numbers',
      });
    }
    
    // Get teacher IDs
    const teacherIds = teachers.map(teacher => teacher._id);
    
    // Add collaborators to hackathon
    hackathon.collaborators = [...new Set([...hackathon.collaborators, ...teacherIds])];
    await hackathon.save();
    
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

// Get completed hackathons
exports.getCompletedHackathons = async (req, res) => {
  try {
    const now = new Date();
    let filter = { endDate: { $lt: now } };
    
    if (req.user.role === 'student') {
      // For students, only show completed hackathons they participated in
      const participatedHackathons = await Participant.find({ userId: req.user.id }).distinct('hackathonId');
      filter._id = { $in: participatedHackathons };
    } else if (req.user.role === 'teacher') {
      // For teachers, show hackathons they created or are collaborators on
      filter.$or = [
        { createdBy: req.user.id },
        { collaborators: req.user.id }
      ];
    }
    
    const hackathons = await Hackathon.find(filter)
      .populate({
        path: 'createdBy',
        select: 'fullName schoolName',
      })
      .populate({
        path: 'collaborators',
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