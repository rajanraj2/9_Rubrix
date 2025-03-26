const Submission = require('../models/submission.model');
const Hackathon = require('../models/hackathon.model');
const Participant = require('../models/participant.model');
const { s3, BUCKET_NAME, getS3ObjectInfo, generatePresignedUrl } = require('../services/s3Service');

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
        message: 'You have already submitted for this hackathon and cannot resubmit',
      });
    }
    
    // Process uploaded files from S3
    let files = [];
    if (req.files && req.files.length > 0) {
      files = await Promise.all(req.files.map(async (file) => {
        try {
          // Get additional information from S3
          const objectInfo = await s3.headObject({
            Bucket: BUCKET_NAME || 'pijamcodemitra',
            Key: file.key
          }).promise();
          
          // Extract ETag (remove quotes)
          const etag = objectInfo.ETag ? objectInfo.ETag.replace(/"/g, '') : null;
          
          return {
            filename: file.originalname,
            path: file.key,
            mimetype: file.mimetype,
            size: file.size,
            url: file.location,
            etag: etag,
            bucket: BUCKET_NAME || 'pijamcodemitra',
            key: file.key,
            s3ObjectId: `${BUCKET_NAME}/${file.key}`
          };
        } catch (err) {
          console.error('Error getting S3 object info:', err);
          // Return basic info if we can't get extended info
          return {
            filename: file.originalname,
            path: file.key,
            mimetype: file.mimetype,
            size: file.size,
            url: file.location,
            bucket: BUCKET_NAME || 'pijamcodemitra',
            key: file.key,
            s3ObjectId: `${BUCKET_NAME}/${file.key}`
          };
        }
      }));
    }
    
    // Validate that either submissionText or files are provided
    if (!submissionText && (!files || files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'You must provide either submission text or files',
      });
    }
    
    // Create submission
    const submission = await Submission.create({
      userId,
      hackathonId,
      submissionText,
      files,
    });
    
    // After creating the submission, add it to the processing queue
    try {
      // Import the Redis client service
      const { addToSubmissionQueue } = require('../services/redisQueueService');
      
      // Get the parameters from the hackathon
      const parameters = hackathon.parameters.map(param => ({
        id: param._id.toString(),
        name: param.name,
        description: param.description
      }));
      
      // Prepare the submission data for the queue
      const submissionData = {
        submission_id: submission._id.toString(),
        hackathon_id: hackathonId,
        parameters: parameters,
        submission_text: submissionText || "",
      };
      
      // If we have files, add the first file's S3 URL to the queue data
      if (files && files.length > 0) {
        submissionData.s3_url = files[0].url;
      }
      
      // Add to Redis queue
      await addToSubmissionQueue(submissionData);
      console.log('Submission added to processing queue:', submission._id);
    } catch (queueError) {
      console.error('Error adding submission to processing queue:', queueError);
      // We don't want to fail the submission if the queue fails, so just log the error
    }
    
    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Submission error:', error);
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
exports.removeShortlisted = async (req, res) => {
  try {
    const { submissionId } = req.body;
    await Submission.findByIdAndUpdate(submissionId, { isShortlisted: false });

    res.json({ success: true, message: 'Submission removed from shortlist' });
} catch (error) {
    console.error('Error removing from shortlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
}
};

// Get user's submissions
exports.getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all submissions by this user
    const submissions = await Submission.find({ userId })
      .populate({
        path: 'hackathonId',
        select: 'title description startDate endDate status parameters',
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

// Get a presigned URL for a submission file
exports.getFilePresignedUrl = async (req, res) => {
  try {
    const { submissionId, fileIndex } = req.params;
    
    // Find the submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }
    
    // Check if user is authorized to view submission
    // Allow if user is the submission creator, hackathon creator, or admin
    const hackathon = await Hackathon.findById(submission.hackathonId);
    if (
      submission.userId.toString() !== req.user.id &&
      hackathon.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this file',
      });
    }
    
    // Check if fileIndex is valid
    const fileIdx = parseInt(fileIndex, 10);
    if (isNaN(fileIdx) || fileIdx < 0 || fileIdx >= submission.files.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file index',
      });
    }
    
    // Get the file info
    const file = submission.files[fileIdx];
    const fileKey = file.key;
    const fileName = file.filename;
    const mimeType = file.mimetype;
    
    // Check if key is valid
    if (!fileKey || fileKey.trim() === '') {
      
      return res.status(400).json({
        success: false,
        message: 'File key is missing or invalid',
      });
    }

    // Generate presigned URL valid for 10 minutes with content disposition
    const presignedUrl = await generatePresignedUrl(fileKey, 600, fileName, mimeType);
    
    res.status(200).json({
      success: true,
      data: {
        presignedUrl,
        filename: fileName,
        mimetype: mimeType,
      },
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a submission evaluation (for worker)
exports.updateSubmissionEvaluation = async (req, res) => {
  try {
    const { evaluation, feedback, totalScore } = req.body;
    
    let submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }
    
    // Update submission evaluation data
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
    console.error('Worker submission update error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}; 