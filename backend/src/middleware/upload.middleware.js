const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create a subfolder for each hackathon to organize files
    const hackathonId = req.body.hackathonId || 'temp';
    const hackathonDir = path.join(uploadDir, hackathonId);
    
    if (!fs.existsSync(hackathonDir)) {
      fs.mkdirSync(hackathonDir, { recursive: true });
    }
    
    cb(null, hackathonDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow specific file types
  const allowedTypes = [
    'application/pdf', // PDF
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOC/DOCX
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPT/PPTX
    'image/jpeg', 'image/png', 'image/gif', // Images
    'video/mp4', 'video/mpeg', 'video/quicktime', // Videos
    'audio/mpeg', 'audio/mp3', 'audio/wav' // Audio
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

// File size limit (2MB)
const limits = {
  fileSize: 2 * 1024 * 1024
};

// Export multer middleware
const upload = multer({
  storage,
  fileFilter,
  limits
});

module.exports = upload; 