const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const adminLoginRoute = require("./routes/adminAuthRoute");
const adminApprovalRoute = require("./routes/adminRoute");
const hackathonRoutes = require('./routes/hackathon.routes');
const submissionRoutes = require('./routes/submission.routes');
const errorHandler = require('./middleware/error.middleware');
const path = require('path');

// Load environment variables
dotenv.config();

// Suppress AWS SDK V2 deprecation warnings - TODO: Migrate to AWS SDK V3 in the future
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
  });

  mongoose.set("debug", true);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/submissions', submissionRoutes);
app.use("/api/admin", adminLoginRoute);
app.use("/api/admin/approval", adminApprovalRoute);

// Root route
app.get('/', (req, res) => {
  res.send('Hackathon Platform API is running');
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 