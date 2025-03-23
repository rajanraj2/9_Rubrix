const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
require('dotenv').config();

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET;

// Create the S3 upload middleware
const uploadToS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME || 'pijamcodemitra',
    acl: 'private',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { 
        fieldName: file.fieldname,
        originalName: file.originalname,
        mimetype: file.mimetype,
        encoding: file.encoding,
        uploadedBy: req.user ? req.user.id : 'anonymous'
      });
    },
    key: (req, file, cb) => {
      const hackathonId = req.body.hackathonId || 'temp';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      
      // Simplified path structure - removed userID level
      cb(null, `submissions/${hackathonId}/${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Allow specific file types
    const allowedTypes = [
      'application/pdf', // PDF
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOC/DOCX
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPT/PPTX
      'text/plain', // TXT
      'application/rtf', // RTF
      'text/csv', // CSV
      'application/json', // JSON
      'text/javascript', // JS
      'text/html', // HTML
      'text/css', // CSS
      'image/jpeg', 'image/png', 'image/gif', // Images
      'video/mp4', 'video/mpeg', 'video/quicktime', // Videos
      'audio/mpeg', 'audio/mp3', 'audio/wav' // Audio
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

// Get S3 object info by key
const getS3ObjectInfo = async (key) => {
  try {
    const params = {
      Bucket: BUCKET_NAME || 'pijamcodemitra',
      Key: key
    };
    
    const headObject = await s3.headObject(params).promise();
    return {
      key,
      size: headObject.ContentLength,
      etag: headObject.ETag.replace(/"/g, ''), // Remove quotes from ETag
      lastModified: headObject.LastModified,
      contentType: headObject.ContentType,
      metadata: headObject.Metadata
    };
  } catch (error) {
    throw error;
  }
};

// Generate a presigned URL for an S3 object (valid for 10 minutes by default)
const generatePresignedUrl = async (key, expiresIn = 600, fileName = '', mimeType = '') => {
  try {
    if (!key || typeof key !== 'string' || key.trim() === '') {
      throw new Error('Invalid S3 key: Key must be a non-empty string');
    }
    
    // Create base parameters
    const params = {
      Bucket: BUCKET_NAME || 'pijamcodemitra',
      Key: key.trim(),
      Expires: expiresIn // 10 minutes in seconds
    };
    
    // If filename and mimetype are provided, set content disposition and type
    if (fileName && mimeType) {
      // Handle specific MIME types to ensure correct download behavior
      if (mimeType.includes('wordprocessingml.document') || 
          mimeType.includes('msword') ||
          mimeType.includes('spreadsheetml') ||
          mimeType.includes('presentationml') ||
          mimeType.includes('audio') ||
          mimeType.includes('video')) {
        params.ResponseContentDisposition = `attachment; filename="${fileName}"`;
        params.ResponseContentType = mimeType;
      }
    }
    
    // Verify params to ensure all required fields are present
    if (!params.Key) {
      throw new Error('Key parameter is required for generating presigned URL');
    }
    
    
    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    throw error;
  }
};

// Delete file from S3
const deleteFileFromS3 = async (key) => {
  try {
    const params = {
      Bucket: BUCKET_NAME || 'pijamcodemitra',
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadToS3,
  deleteFileFromS3,
  getS3ObjectInfo,
  generatePresignedUrl,
  s3,
  BUCKET_NAME
}; 