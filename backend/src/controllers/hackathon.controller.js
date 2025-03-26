const Hackathon = require('../models/hackathon.model');
const Participant = require('../models/participant.model');
const Submission = require('../models/submission.model');
const User = require('../models/user.model');

// Create a new hackathon
exports.createHackathon = async (req, res) => {
  try {
    // Generate a unique code if not provided
    if (!req.body.uniqueCode) {
      req.body.uniqueCode = generateUniqueCode();
    }
    
    // Add creator to the hackathon data
    req.body.createdBy = req.user.id;
    
    // Create the hackathon
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

// Generate a unique 6-character alphanumeric code
const generateUniqueCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Get all hackathons
exports.getHackathons = async (req, res) => {
  try {
    // Filter options based on user role
    let filter = {};
    
    if (req.user.role === 'student') {
      // Get all hackathons
      const allHackathons = await Hackathon.find();
      const eligibleHackathonIds = [];
      const participatedHackathons = await Participant.find({ userId: req.user.id }).distinct('hackathonId');
      
      // First, always include hackathons the student is already registered for
      for (const participatedId of participatedHackathons) {
        eligibleHackathonIds.push(participatedId);
      }
      
      // For each hackathon, check if student is eligible based on criteria
      for (const hackathon of allHackathons) {
        // Skip if already added (the student is already registered)
        if (participatedHackathons.includes(hackathon._id.toString())) {
          continue;
        }

        // Check if any "codeOnly" criteria exists
        const hasCodeOnlyCriteria = hackathon.eligibilityCriteria && hackathon.eligibilityCriteria.some(
          criteria => criteria.criteriaType === 'codeOnly'
        );

        // If codeOnly criteria exists, student needs to join with code
        if (hasCodeOnlyCriteria) {
          continue;
        }

        // If no criteria, everyone is eligible
        if (!hackathon.eligibilityCriteria || hackathon.eligibilityCriteria.length === 0) {
          eligibleHackathonIds.push(hackathon._id);
          continue;
        }
        
        // Otherwise, check other criteria
        const student = await User.findById(req.user.id);
        if (!student) {
          continue;
        }
        
        let isEligible = false;
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
      
      // Check if user is already a participant
      const isParticipant = await Participant.findOne({ 
        hackathonId: hackathon._id, 
        userId: req.user.id 
      });
      
      // If they're already a participant, they're eligible
      if (isParticipant) {
        isEligible = true;
      }
      // If not a participant, check if hackathon has a "codeOnly" criteria
      else if (hackathon.eligibilityCriteria && hackathon.eligibilityCriteria.length > 0) {
        const hasCodeOnlyCriteria = hackathon.eligibilityCriteria.some(
          criteria => criteria.criteriaType === 'codeOnly'
        );
        
        // If there's a codeOnly criteria, student must join with code
        if (hasCodeOnlyCriteria) {
          isEligible = false;
        }
        // Otherwise, check other criteria
        else {
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
      }
      
      // Check if hackathon is complete - completed hackathons can be viewed by participants
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
      const isCreator = hackathon.createdBy._id.toString() === req.user.id;
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
    console.log("hackathonWithCounts: ", hackathonWithCounts);
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
      // If already registered, just return success
      return res.status(200).json({
        success: true,
        message: 'User is already registered for this hackathon',
        data: existingParticipant,
      });
    }

    // For student users, check eligibility
    if (req.user.role === 'student') {
      if (req.user.id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Students can only register themselves',
        });
      }

      // Check if the hackathon has code-only criteria
      const hasCodeOnlyCriteria = hackathon.eligibilityCriteria && 
        hackathon.eligibilityCriteria.some(criteria => criteria.criteriaType === 'codeOnly');

      if (hasCodeOnlyCriteria) {
        // For code-only hackathons, we need to check if they've joined using the code
        // This should be done by joining with the code first, which creates a participant record
        // Since we already checked for existing participants above, if we get here for a code-only
        // hackathon, it means they haven't joined with the code yet
        return res.status(403).json({
          success: false,
          message: 'This hackathon requires a join code. Please use the join code to participate.',
        });
      }

      // For other eligibility types, check if they meet criteria
      let isEligible = false;
      
      // If no criteria, everyone is eligible
      if (!hackathon.eligibilityCriteria || hackathon.eligibilityCriteria.length === 0) {
        isEligible = true;
      } else {
        const student = await User.findById(userId);
        
        // Check each criteria
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
      
      if (!isEligible) {
        return res.status(403).json({
          success: false,
          message: 'You are not eligible for this hackathon',
        });
      }
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
    const hackathonId =req.params.id;
    
    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId).select('parameters');
    if (!hackathon) {
      console.log("hackathon not found");
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


      const leaderboard = submissions.map(submission => ({
        ...submission,
        parameters: hackathon.parameters, // Attach parameters dynamically
    }));

    // Sort leaderboard by totalScore in descending order
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    // res.status(200).json({ success: true, data: leaderboard });

    res.status(200).json({
      success: true,
      count: hackathon.length,
      data: submissions,
    });
    console.log("res data: ", submissions);
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

// Join a hackathon using a unique code
exports.joinByCode = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a hackathon code',
      });
    }
    
    // Find the hackathon with the provided code
    const hackathon = await Hackathon.findOne({ uniqueCode: code.toUpperCase() });
    
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'No hackathon found with this code',
      });
    }
    
    const userId = req.user.id;
    
    // Check if user is already a participant
    const existingParticipant = await Participant.findOne({
      userId,
      hackathonId: hackathon._id,
    });
    
    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this hackathon',
      });
    }
    
    // Register the user as a participant
    const newParticipant = await Participant.create({
      userId,
      hackathonId: hackathon._id,
    });
    
    // Get full hackathon details for the response
    const hackathonWithCounts = await getHackathonWithCounts(hackathon._id);
    
    res.status(200).json({
      success: true,
      data: hackathonWithCounts,
      message: 'Successfully joined the hackathon',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to get hackathon with counts
const getHackathonWithCounts = async (hackathonId) => {
  const hackathon = await Hackathon.findById(hackathonId)
    .populate({
      path: 'createdBy',
      select: 'fullName schoolName',
    })
    .populate({
      path: 'collaborators',
      select: 'fullName schoolName',
    });

  const participantCount = await Participant.countDocuments({ hackathonId });
  const submissionCount = await Submission.countDocuments({ hackathonId });

  return {
    ...hackathon.toObject(),
    participants: participantCount,
    submissions: submissionCount,
  };
}; 