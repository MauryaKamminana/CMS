const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const lostItemRoutes = require('./routes/lostItemRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const healthRoutes = require('./routes/health');
const debugRoutes = require('./routes/debug');
const courseRoutes = require('./routes/courseRoutes');
const jobRoutes = require('./routes/jobRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const canteenRoutes = require('./routes/canteenRoutes');

// Load environment variables
dotenv.config();

// Passport config
require('./config/passport');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    
    // Mount routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/announcements', announcementRoutes);
    app.use('/api/lost-items', lostItemRoutes);
    app.use('/api/assignments', assignmentRoutes);
    app.use('/api/submissions', submissionRoutes);
    app.use('/api/attendance', attendanceRoutes);
    app.use('/api/resources', resourceRoutes);
    app.use('/api/health', healthRoutes);
    app.use('/api/debug', debugRoutes);
    app.use('/api/courses', courseRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/canteen', canteenRoutes);

    // Serve static assets in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../frontend/build')));
      
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
      });
    }

    // Also add this to serve static files
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Error handling middleware
    const errorHandler = require('./middleware/errorHandler');
    app.use(errorHandler);

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle deprecation warnings
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && 
      warning.message.includes('util._extend')) {
    // Ignore this specific deprecation warning
    return;
  }
  // Log other warnings
  console.warn(warning.name, warning.message);
}); 