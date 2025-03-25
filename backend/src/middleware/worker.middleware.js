/**
 * Middleware to authenticate worker requests using API key
 */

// Worker API key authentication middleware
exports.workerApiKey = (req, res, next) => {
  try {
    // Get token from the Authorization header
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'API key required for worker access',
      });
    }
    
    // Check if the token matches the worker API key
    const workerApiKey = process.env.WORKER_API_KEY || 'workerkey';
    
    if (token !== workerApiKey) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key',
      });
    }
    
    // Add worker flag to request
    req.isWorker = true;
    
    next();
  } catch (error) {
    console.error('Worker API key error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
}; 