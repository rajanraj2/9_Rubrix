/**
 * Submission Worker
 * 
 * This script processes submissions from the Redis queue and sends them to the FastAPI backend
 * for transcription and evaluation.
 */

const axios = require('axios');
const { createClient } = require('redis');
require('dotenv').config();

// Redis client configuration
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({ url: redisUrl });

// Queue name
const SUBMISSION_QUEUE = 'submission:queue';

// Redis connection state
let isRedisConnected = false;

// Connect to Redis
async function connectToRedis() {
  try {
    client.on('error', (err) => {
      console.error('Redis client error:', err);
      isRedisConnected = false;
      
      // Try to reconnect after a delay if not in a reconnection attempt
      if (!reconnectingToRedis) {
        reconnectToRedis();
      }
    });
    
    client.on('connect', () => {
      console.log('Connected to Redis');
      isRedisConnected = true;
    });
    
    client.on('end', () => {
      console.log('Redis connection closed');
      isRedisConnected = false;
    });
    
    await client.connect();
    isRedisConnected = true;
    return true;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    isRedisConnected = false;
    return false;
  }
}

// Reconnection flag to prevent multiple reconnection attempts
let reconnectingToRedis = false;

// Reconnect to Redis
async function reconnectToRedis() {
  if (reconnectingToRedis) return;
  
  reconnectingToRedis = true;
  console.log('Attempting to reconnect to Redis...');
  
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries && !isRedisConnected) {
    try {
      console.log(`Reconnection attempt ${retries + 1}/${maxRetries}...`);
      
      // Close the existing client if it's still active
      try {
        if (client.isOpen) {
          await client.disconnect();
        }
      } catch (err) {
        console.error('Error disconnecting Redis client:', err);
      }
      
      // Wait for a few seconds before attempting to reconnect
      const delay = Math.min(1000 * Math.pow(2, retries), 30000); // Exponential backoff with max 30s
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Connect again
      await connectToRedis();
      
      if (isRedisConnected) {
        console.log('Successfully reconnected to Redis');
        break;
      }
    } catch (error) {
      console.error(`Reconnection attempt ${retries + 1} failed:`, error);
    }
    
    retries++;
  }
  
  if (!isRedisConnected) {
    console.error(`Failed to reconnect to Redis after ${maxRetries} attempts. Will retry later.`);
  }
  
  reconnectingToRedis = false;
}

// Initialize Redis connection
connectToRedis();

// Redis queue functions
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

// Configuration
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
const FASTAPI_ENDPOINT = `${FASTAPI_URL}/api/transcribe_and_evaluate/`;
const POLLING_INTERVAL = process.env.WORKER_POLLING_INTERVAL || 5000; // 5 seconds by default

/**
 * Process a submission by sending it to the FastAPI backend
 * 
 * @param {Object} submission - The submission data from the queue
 * @returns {Promise<Object>} - The evaluation results
 */
async function processSubmission(submission) {
  console.log(`Processing submission ID: ${submission.submission_id}`);
  
  try {
    // Send the submission to FastAPI
    const response = await axios.post(FASTAPI_ENDPOINT, submission, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Log the response
    console.log(`Processed submission ID: ${submission.submission_id}`);
    console.log(`Status: ${response.data.status}`);
    console.log(`Overall score: ${response.data.overall_score || 'N/A'}`);
    
    if (response.data.status === 'success') {
      console.log(`Submission ${submission.submission_id} successfully processed and stored in database`);
      return response.data;
    } else {
      throw new Error(`FastAPI processing failed: ${response.data.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`Error processing submission ${submission.submission_id}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

/**
 * The main worker loop that polls the queue for new submissions
 */
async function workerLoop() {
  try {
    // Check if Redis is connected
    if (!isRedisConnected) {
      console.log('Redis is not connected. Attempting to reconnect...');
      if (!reconnectingToRedis) {
        reconnectToRedis();
      }
      
      // Skip this iteration and try again later
      setTimeout(workerLoop, POLLING_INTERVAL);
      return;
    }
    
    // Get the queue length
    const queueLength = await getQueueLength();
    console.log(`Queue length: ${queueLength}`);
    
    if (queueLength > 0) {
      // Get the next submission from the queue
      const submission = await getNextSubmission();
      
      if (submission) {
        try {
          // Process the submission
          await processSubmission(submission);
        } catch (error) {
          console.error('Error in processing submission:', error.message);
          // In a production environment, you might want to implement retries or a dead-letter queue
        }
      }
    }
  } catch (error) {
    console.error('Error in worker loop:', error.message);
    
    // If Redis connection error, attempt reconnection
    if (error.message.includes('Redis')) {
      if (!reconnectingToRedis) {
        reconnectToRedis();
      }
    }
  }
  
  // Schedule the next iteration
  setTimeout(workerLoop, POLLING_INTERVAL);
}

// Start the worker
console.log('Starting submission processing worker...');
workerLoop();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Worker shutting down...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Worker shutting down...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Keep the worker running despite errors
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  // Keep the worker running despite errors
}); 