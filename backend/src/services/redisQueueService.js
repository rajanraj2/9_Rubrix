const { createClient } = require('redis');
require('dotenv').config();

// Redis client configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({ url: redisUrl });

// Queue name
const SUBMISSION_QUEUE = 'submission:queue';

// Connect to Redis
(async () => {
  client.on('error', (err) => console.error('Redis client error:', err));
  
  try {
    await client.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

/**
 * Add a submission to the processing queue
 * 
 * @param {Object} submission - The submission data
 * @param {string} submission.submission_id - The submission ID
 * @param {string} submission.hackathon_id - The hackathon ID
 * @param {Array} submission.parameters - The evaluation parameters
 * @param {string} [submission.s3_url] - The S3 URL (optional if submission_text is provided)
 * @param {string} [submission.submission_text] - The submission text (optional if s3_url is provided)
 * @returns {Promise<boolean>} - Returns true if added successfully
 */
const addToSubmissionQueue = async (submission) => {
  try {
    // Validate required fields
    if (!submission.submission_id || !submission.hackathon_id || !submission.parameters) {
      throw new Error('Missing required submission data');
    }
    
    // Validate that we have either s3_url or submission_text
    if (!submission.s3_url && !submission.submission_text) {
      throw new Error('Either s3_url or submission_text must be provided');
    }
    
    // Add to queue (use RPUSH to append to the end of the list)
    await client.rPush(SUBMISSION_QUEUE, JSON.stringify(submission));
    
    return true;
  } catch (error) {
    console.error('Error adding to Redis queue:', error);
    throw error;
  }
};

/**
 * Get the next submission from the queue without removing it
 * 
 * @returns {Promise<Object|null>} - The next submission in the queue or null if empty
 */
const peekNextSubmission = async () => {
  try {
    const submission = await client.lIndex(SUBMISSION_QUEUE, 0);
    return submission ? JSON.parse(submission) : null;
  } catch (error) {
    console.error('Error peeking at Redis queue:', error);
    throw error;
  }
};

/**
 * Get and remove the next submission from the queue
 * 
 * @returns {Promise<Object|null>} - The next submission in the queue or null if empty
 */
const getNextSubmission = async () => {
  try {
    const submission = await client.lPop(SUBMISSION_QUEUE);
    return submission ? JSON.parse(submission) : null;
  } catch (error) {
    console.error('Error getting from Redis queue:', error);
    throw error;
  }
};

/**
 * Get the length of the submission queue
 * 
 * @returns {Promise<number>} - The number of submissions in the queue
 */
const getQueueLength = async () => {
  try {
    return await client.lLen(SUBMISSION_QUEUE);
  } catch (error) {
    console.error('Error getting Redis queue length:', error);
    throw error;
  }
};

module.exports = {
  addToSubmissionQueue,
  peekNextSubmission,
  getNextSubmission,
  getQueueLength,
  client
}; 