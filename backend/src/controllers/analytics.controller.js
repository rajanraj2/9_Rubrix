const Submission = require('../models/submission.model');
const Hackathon = require('../models/hackathon.model');
const Participant = require('../models/participant.model');
const User = require('../models/user.model');

/**
 * Generate insights for a hackathon based on provided criteria
 * @route GET /api/analytics/insights/:hackathonId
 * @access Private (Teacher/Admin)
 */
exports.generateInsights = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { 
      demographic_filters = {}, 
      parameter_criteria = {}, 
      score_threshold = 0 
    } = req.query;

    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }

    // Check authorization
    if (hackathon.createdBy.toString() !== req.user.id && 
        !hackathon.collaborators.includes(req.user.id) && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this hackathon',
      });
    }

    // Get all submissions for the hackathon
    const submissions = await Submission.find({ hackathonId })
      .populate({
        path: 'userId',
        select: 'fullName phoneNumber state district grade gender schoolName schoolCollegeName'
      });

    if (!submissions.length) {
      return res.status(200).json({
        success: true,
        message: 'No submissions found for this hackathon',
        data: {
          demographicInsights: {},
          parameterInsights: {},
          overallScores: {}
        }
      });
    }

    // Apply demographic filters if any
    let filteredSubmissions = submissions;
    if (Object.keys(demographic_filters).length > 0) {
      filteredSubmissions = submissions.filter(submission => {
        const user = submission.userId;
        if (!user) return false;

        for (const [key, value] of Object.entries(demographic_filters)) {
          if (Array.isArray(value)) {
            if (!value.includes(user[key])) return false;
          } else {
            if (user[key] !== value) return false;
          }
        }
        return true;
      });
    }

    // Generate demographic insights
    const demographicInsights = {
      byState: countByProperty(filteredSubmissions, 'state'),
      byGender: countByProperty(filteredSubmissions, 'gender'),
      byGrade: countByProperty(filteredSubmissions, 'grade'),
      bySchool: countByProperty(filteredSubmissions, 'schoolName', 'schoolCollegeName'),
      byDistrict: countByProperty(filteredSubmissions, 'district')
    };

    // Generate parameter insights
    const parameterInsights = generateParameterInsights(
      filteredSubmissions, 
      hackathon.parameters,
      parameter_criteria
    );

    // Generate overall score insights
    const overallScores = {
      average: calculateAverageScore(filteredSubmissions),
      distribution: generateScoreDistribution(filteredSubmissions),
      topPerformers: getTopPerformers(filteredSubmissions, 5),
      scoreThreshold: {
        count: filteredSubmissions.filter(sub => sub.totalScore >= score_threshold).length,
        percentage: (filteredSubmissions.filter(sub => sub.totalScore >= score_threshold).length / filteredSubmissions.length) * 100
      }
    };

    res.status(200).json({
      success: true,
      data: {
        totalSubmissions: filteredSubmissions.length,
        demographicInsights,
        parameterInsights,
        overallScores
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Generate custom leaderboard based on filters and grouping criteria
 * @route GET /api/analytics/leaderboard/:hackathonId
 * @access Private (Teacher/Admin)
 */
exports.generateLeaderboard = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { 
      filters = {},
      group_by = null,
      sort_by = 'totalScore',
      sort_order = 'desc',
      limit = 100,
      min_score = 0
    } = req.query;

    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }

    // Check authorization
    if (hackathon.createdBy.toString() !== req.user.id && 
        !hackathon.collaborators.includes(req.user.id) && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this hackathon',
      });
    }

    // Get all submissions for the hackathon
    const submissions = await Submission.find({ hackathonId, totalScore: { $gte: min_score } })
      .populate({
        path: 'userId',
        select: 'fullName phoneNumber state district grade gender schoolName schoolCollegeName'
      });

    if (!submissions.length) {
      return res.status(200).json({
        success: true,
        message: 'No submissions found for this hackathon',
        data: []
      });
    }

    // Apply filters if any
    let filteredSubmissions = submissions;
    if (Object.keys(filters).length > 0) {
      filteredSubmissions = submissions.filter(submission => {
        const user = submission.userId;
        if (!user) return false;

        for (const [key, value] of Object.entries(filters)) {
          if (Array.isArray(value)) {
            if (!value.includes(user[key])) return false;
          } else {
            if (user[key] !== value) return false;
          }
        }
        return true;
      });
    }

    // Group submissions if needed
    let leaderboardData;
    if (group_by) {
      leaderboardData = generateGroupedLeaderboard(filteredSubmissions, group_by, sort_by, sort_order);
    } else {
      // Sort and limit individual submissions
      leaderboardData = filteredSubmissions
        .sort((a, b) => {
          const aValue = getNestedProperty(a, sort_by);
          const bValue = getNestedProperty(b, sort_by);
          return sort_order === 'asc' ? aValue - bValue : bValue - aValue;
        })
        .slice(0, limit)
        .map((submission, index) => ({
          rank: index + 1,
          submissionId: submission._id,
          user: {
            id: submission.userId._id,
            name: submission.userId.fullName,
            grade: submission.userId.grade,
            school: submission.userId.schoolName || submission.userId.schoolCollegeName,
            state: submission.userId.state,
            district: submission.userId.district,
            gender: submission.userId.gender
          },
          totalScore: submission.totalScore,
          parameterScores: submission.evaluation.map(eval => ({
            parameter: eval.parameterName,
            score: eval.score
          })),
          isShortlisted: submission.isShortlisted
        }));
    }

    res.status(200).json({
      success: true,
      count: leaderboardData.length,
      data: leaderboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Group students into clusters based on specified parameters
 * @route GET /api/analytics/clusters/:hackathonId
 * @access Private (Teacher/Admin)
 */
exports.generateClusters = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { 
      cluster_by = 'parameters',
      num_clusters = 3, 
      parameters = [], 
      filters = {} 
    } = req.body;

    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }

    // Check authorization
    if (hackathon.createdBy.toString() !== req.user.id && 
        !hackathon.collaborators.includes(req.user.id) && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this hackathon',
      });
    }

    // Get all submissions for the hackathon
    const submissions = await Submission.find({ hackathonId })
      .populate({
        path: 'userId',
        select: 'fullName phoneNumber state district grade gender schoolName schoolCollegeName'
      });

    if (!submissions.length) {
      return res.status(200).json({
        success: true,
        message: 'No submissions found for this hackathon',
        data: []
      });
    }

    // Apply filters if any
    let filteredSubmissions = submissions;
    if (Object.keys(filters).length > 0) {
      filteredSubmissions = submissions.filter(submission => {
        const user = submission.userId;
        if (!user) return false;

        for (const [key, value] of Object.entries(filters)) {
          if (Array.isArray(value)) {
            if (!value.includes(user[key])) return false;
          } else {
            if (user[key] !== value) return false;
          }
        }
        return true;
      });
    }

    // Generate clusters based on specified method
    let clusters = [];
    if (cluster_by === 'parameters') {
      clusters = generateParameterBasedClusters(filteredSubmissions, hackathon.parameters, parameters, num_clusters);
    } else if (cluster_by === 'demographics') {
      clusters = generateDemographicBasedClusters(filteredSubmissions, num_clusters);
    } else if (cluster_by === 'scores') {
      clusters = generateScoreBasedClusters(filteredSubmissions, num_clusters);
    }

    res.status(200).json({
      success: true,
      count: clusters.length,
      data: clusters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Shortlist students based on criteria
 * @route POST /api/analytics/shortlist/:hackathonId
 * @access Private (Teacher/Admin)
 */
exports.shortlistStudents = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { 
      criteria = {}, 
      auto_shortlist = false 
    } = req.body;

    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }

    // Check authorization
    if (hackathon.createdBy.toString() !== req.user.id && 
        !hackathon.collaborators.includes(req.user.id) && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this hackathon',
      });
    }

    // Get all submissions for the hackathon
    const submissions = await Submission.find({ hackathonId })
      .populate({
        path: 'userId',
        select: 'fullName phoneNumber state district grade gender schoolName schoolCollegeName'
      });

    if (!submissions.length) {
      return res.status(200).json({
        success: true,
        message: 'No submissions found for this hackathon',
        data: []
      });
    }

    // Filter submissions based on criteria
    const eligibleSubmissions = submissions.filter(submission => {
      // Check total score
      if (criteria.min_total_score && submission.totalScore < criteria.min_total_score) {
        return false;
      }
      
      // Check parameter scores
      if (criteria.parameter_scores && criteria.parameter_scores.length > 0) {
        for (const paramCriteria of criteria.parameter_scores) {
          const evalItem = submission.evaluation.find(e => 
            e.parameterId.toString() === paramCriteria.parameterId || 
            e.parameterName === paramCriteria.parameterName
          );
          
          if (!evalItem || evalItem.score < paramCriteria.min_score) {
            return false;
          }
        }
      }
      
      // Check demographic criteria
      if (criteria.demographics) {
        const user = submission.userId;
        for (const [key, value] of Object.entries(criteria.demographics)) {
          if (Array.isArray(value)) {
            if (!value.includes(user[key])) return false;
          } else {
            if (user[key] !== value) return false;
          }
        }
      }
      
      return true;
    });

    // Automatically shortlist if requested
    if (auto_shortlist) {
      const submissionIds = eligibleSubmissions.map(sub => sub._id);
      await Submission.updateMany(
        { _id: { $in: submissionIds } },
        { $set: { isShortlisted: true } }
      );
    }

    // Format response
    const shortlistedData = eligibleSubmissions.map(submission => ({
      submissionId: submission._id,
      user: {
        id: submission.userId._id,
        name: submission.userId.fullName,
        grade: submission.userId.grade,
        school: submission.userId.schoolName || submission.userId.schoolCollegeName,
        state: submission.userId.state,
        district: submission.userId.district,
        gender: submission.userId.gender
      },
      totalScore: submission.totalScore,
      parameterScores: submission.evaluation.map(eval => ({
        parameter: eval.parameterName,
        score: eval.score
      })),
      isShortlisted: auto_shortlist ? true : submission.isShortlisted
    }));

    res.status(200).json({
      success: true,
      count: shortlistedData.length,
      data: shortlistedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get shortlisted students
 * @route GET /api/analytics/shortlisted/:hackathonId
 * @access Private (Teacher/Admin)
 */
exports.getShortlistedStudents = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found',
      });
    }

    // Check authorization
    if (hackathon.createdBy.toString() !== req.user.id && 
        !hackathon.collaborators.includes(req.user.id) && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this hackathon',
      });
    }

    // Get all shortlisted submissions
    const shortlistedSubmissions = await Submission.find({ 
      hackathonId, 
      isShortlisted: true 
    }).populate({
      path: 'userId',
      select: 'fullName phoneNumber state district grade gender schoolName schoolCollegeName'
    });

    // Format response
    const formattedData = shortlistedSubmissions.map(submission => ({
      submissionId: submission._id,
      user: {
        id: submission.userId._id,
        name: submission.userId.fullName,
        grade: submission.userId.grade,
        school: submission.userId.schoolName || submission.userId.schoolCollegeName,
        state: submission.userId.state,
        district: submission.userId.district,
        gender: submission.userId.gender
      },
      totalScore: submission.totalScore,
      parameterScores: submission.evaluation.map(eval => ({
        parameter: eval.parameterName,
        score: eval.score
      }))
    }));

    res.status(200).json({
      success: true,
      count: formattedData.length,
      data: formattedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper functions
function countByProperty(submissions, property, alternateProperty = null) {
  const counts = {};
  
  submissions.forEach(submission => {
    const user = submission.userId;
    if (!user) return;
    
    let value = user[property];
    
    // If primary property is empty but alternate exists, use that
    if ((!value || value === '') && alternateProperty && user[alternateProperty]) {
      value = user[alternateProperty];
    }
    
    // Skip if still no value
    if (!value || value === '') return;
    
    counts[value] = (counts[value] || 0) + 1;
  });
  
  return counts;
}

function generateParameterInsights(submissions, parameters, criteria) {
  const insights = {};
  
  parameters.forEach(param => {
    const paramId = param._id.toString();
    const paramName = param.name;
    
    const scores = submissions
      .filter(sub => sub.evaluation && sub.evaluation.length > 0)
      .map(sub => {
        const evalItem = sub.evaluation.find(e => 
          e.parameterId.toString() === paramId || 
          e.parameterName === paramName
        );
        return evalItem ? evalItem.score : 0;
      });
    
    insights[paramName] = {
      average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      highest: scores.length > 0 ? Math.max(...scores) : 0,
      lowest: scores.length > 0 ? Math.min(...scores) : 0,
      distribution: generateScoreDistribution(scores)
    };
    
    // Apply specific parameter criteria if any
    if (criteria && criteria[paramId]) {
      const threshold = criteria[paramId];
      insights[paramName].aboveThreshold = {
        count: scores.filter(score => score >= threshold).length,
        percentage: (scores.filter(score => score >= threshold).length / scores.length) * 100
      };
    }
  });
  
  return insights;
}

function calculateAverageScore(submissions) {
  if (!submissions.length) return 0;
  return submissions.reduce((sum, sub) => sum + sub.totalScore, 0) / submissions.length;
}

function generateScoreDistribution(scores) {
  if (!Array.isArray(scores)) {
    scores = scores.map(sub => sub.totalScore);
  }
  
  const distribution = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0
  };
  
  scores.forEach(score => {
    if (score <= 20) distribution['0-20']++;
    else if (score <= 40) distribution['21-40']++;
    else if (score <= 60) distribution['41-60']++;
    else if (score <= 80) distribution['61-80']++;
    else distribution['81-100']++;
  });
  
  // Convert to percentages
  const total = scores.length;
  if (total > 0) {
    for (const range in distribution) {
      distribution[range] = (distribution[range] / total) * 100;
    }
  }
  
  return distribution;
}

function getTopPerformers(submissions, limit = 5) {
  return submissions
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit)
    .map(submission => ({
      submissionId: submission._id,
      user: {
        name: submission.userId.fullName,
        school: submission.userId.schoolName || submission.userId.schoolCollegeName,
        grade: submission.userId.grade
      },
      totalScore: submission.totalScore
    }));
}

function getNestedProperty(obj, path) {
  const keys = path.split('.');
  return keys.reduce((o, k) => (o || {})[k], obj) || 0;
}

function generateGroupedLeaderboard(submissions, groupBy, sortBy, sortOrder) {
  // Group submissions
  const groups = {};
  
  submissions.forEach(submission => {
    const user = submission.userId;
    if (!user) return;
    
    const groupValue = user[groupBy];
    if (!groupValue) return;
    
    if (!groups[groupValue]) {
      groups[groupValue] = [];
    }
    
    groups[groupValue].push(submission);
  });
  
  // Calculate group scores
  const groupedScores = Object.entries(groups).map(([groupName, groupSubmissions]) => {
    const totalScore = groupSubmissions.reduce((sum, sub) => sum + sub.totalScore, 0);
    const averageScore = totalScore / groupSubmissions.length;
    
    // Calculate parameter averages
    const parameterScores = {};
    groupSubmissions.forEach(sub => {
      sub.evaluation.forEach(eval => {
        if (!parameterScores[eval.parameterName]) {
          parameterScores[eval.parameterName] = {
            total: 0,
            count: 0
          };
        }
        parameterScores[eval.parameterName].total += eval.score;
        parameterScores[eval.parameterName].count++;
      });
    });
    
    const formattedParameterScores = Object.entries(parameterScores).map(([param, data]) => ({
      parameter: param,
      score: data.total / data.count
    }));
    
    return {
      groupName,
      submissionCount: groupSubmissions.length,
      averageScore,
      parameterScores: formattedParameterScores,
      topPerformer: getTopPerformers(groupSubmissions, 1)[0]
    };
  });
  
  // Sort groups by the specified criteria
  return groupedScores.sort((a, b) => {
    const aValue = getNestedProperty(a, sortBy);
    const bValue = getNestedProperty(b, sortBy);
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });
}

// Function for clustering submissions based on parameters
function generateParameterBasedClusters(submissions, allParameters, selectedParameters, numClusters) {
  // If no specific parameters selected, use all parameters
  const parameters = selectedParameters.length > 0 
    ? allParameters.filter(p => selectedParameters.includes(p._id.toString()) || selectedParameters.includes(p.name))
    : allParameters;
  
  // Simple K-means like approach (just a simulation for the dummy endpoint)
  const parameterIds = parameters.map(p => p._id.toString());
  
  // Create feature vectors (parameter scores)
  const vectors = submissions.map(sub => {
    const features = parameterIds.map(paramId => {
      const evalItem = sub.evaluation.find(e => e.parameterId.toString() === paramId);
      return evalItem ? evalItem.score : 0;
    });
    
    return {
      submission: sub,
      features
    };
  });
  
  // Dummy clustering logic - simply divide into numClusters based on total score
  vectors.sort((a, b) => {
    const aScore = a.submission.totalScore;
    const bScore = b.submission.totalScore;
    return bScore - aScore;
  });
  
  const clusterSize = Math.ceil(vectors.length / numClusters);
  const clusters = [];
  
  for (let i = 0; i < numClusters; i++) {
    const start = i * clusterSize;
    const end = Math.min(start + clusterSize, vectors.length);
    if (start >= vectors.length) break;
    
    const clusterVectors = vectors.slice(start, end);
    
    // Calculate cluster centroid (average score for each parameter)
    const centroid = [];
    for (let j = 0; j < parameters.length; j++) {
      const paramScores = clusterVectors.map(v => v.features[j]);
      centroid.push(paramScores.reduce((a, b) => a + b, 0) / paramScores.length);
    }
    
    // Format cluster data
    clusters.push({
      clusterId: i + 1,
      clusterName: getClusterName(i, numClusters),
      size: clusterVectors.length,
      centroid: parameters.map((param, idx) => ({
        parameter: param.name,
        score: centroid[idx]
      })),
      averageScore: clusterVectors.reduce((sum, v) => sum + v.submission.totalScore, 0) / clusterVectors.length,
      members: clusterVectors.map(v => ({
        submissionId: v.submission._id,
        user: {
          id: v.submission.userId._id,
          name: v.submission.userId.fullName,
          school: v.submission.userId.schoolName || v.submission.userId.schoolCollegeName,
          grade: v.submission.userId.grade
        },
        totalScore: v.submission.totalScore
      }))
    });
  }
  
  return clusters;
}

// Function for clustering submissions based on demographics
function generateDemographicBasedClusters(submissions, numClusters) {
  // Simplified: cluster by grade or school
  const byGrade = {};
  
  submissions.forEach(sub => {
    const user = sub.userId;
    if (!user || !user.grade) return;
    
    if (!byGrade[user.grade]) {
      byGrade[user.grade] = [];
    }
    
    byGrade[user.grade].push(sub);
  });
  
  // Convert to array of clusters
  const clusters = Object.entries(byGrade)
    .map(([grade, subs], index) => ({
      clusterId: index + 1,
      clusterName: `Grade ${grade}`,
      size: subs.length,
      averageScore: subs.reduce((sum, sub) => sum + sub.totalScore, 0) / subs.length,
      members: subs.map(sub => ({
        submissionId: sub._id,
        user: {
          id: sub.userId._id,
          name: sub.userId.fullName,
          school: sub.userId.schoolName || sub.userId.schoolCollegeName,
          grade: sub.userId.grade
        },
        totalScore: sub.totalScore
      }))
    }));
  
  return clusters.slice(0, numClusters);
}

// Function for clustering submissions based on total scores
function generateScoreBasedClusters(submissions, numClusters) {
  // Sort by total score
  submissions.sort((a, b) => b.totalScore - a.totalScore);
  
  const clusterSize = Math.ceil(submissions.length / numClusters);
  const clusters = [];
  
  for (let i = 0; i < numClusters; i++) {
    const start = i * clusterSize;
    const end = Math.min(start + clusterSize, submissions.length);
    if (start >= submissions.length) break;
    
    const clusterSubmissions = submissions.slice(start, end);
    
    clusters.push({
      clusterId: i + 1,
      clusterName: getScoreClusterName(i, numClusters),
      size: clusterSubmissions.length,
      averageScore: clusterSubmissions.reduce((sum, sub) => sum + sub.totalScore, 0) / clusterSubmissions.length,
      members: clusterSubmissions.map(sub => ({
        submissionId: sub._id,
        user: {
          id: sub.userId._id,
          name: sub.userId.fullName,
          school: sub.userId.schoolName || sub.userId.schoolCollegeName,
          grade: sub.userId.grade
        },
        totalScore: sub.totalScore
      }))
    });
  }
  
  return clusters;
}

function getClusterName(index, total) {
  const names = ['High Performers', 'Medium Performers', 'Developing Performers'];
  if (index < names.length) return names[index];
  return `Cluster ${index + 1}`;
}

function getScoreClusterName(index, total) {
  if (total === 3) {
    const names = ['Top Tier', 'Middle Tier', 'Lower Tier'];
    return names[index] || `Tier ${index + 1}`;
  }
  
  if (index === 0) return 'Top Performers';
  if (index === total - 1) return 'Developing Performers';
  return `Tier ${index + 1}`;
} 