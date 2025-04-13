const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const mongoose = require('mongoose');
const Course = require('../models/Course');

// @desc    Debug endpoint to check API connectivity
// @route   GET /api/debug
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Debug endpoint is working',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    headers: req.headers,
    apiVersion: '1.0.0'
  });
});

// @desc    Echo request body for testing
// @route   POST /api/debug/echo
// @access  Public
router.post('/echo', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Echo endpoint',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// @desc    Debug auth endpoint
// @route   GET /api/debug/auth
// @access  Private
router.get('/auth', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    },
    headers: {
      authorization: req.headers.authorization ? 'Present' : 'Missing'
    }
  });
});

// @desc    Debug database connection
// @route   GET /api/debug/db
// @access  Public
router.get('/db', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    
    let status;
    switch (dbStatus) {
      case 0:
        status = 'Disconnected';
        break;
      case 1:
        status = 'Connected';
        break;
      case 2:
        status = 'Connecting';
        break;
      case 3:
        status = 'Disconnecting';
        break;
      default:
        status = 'Unknown';
    }
    
    res.status(200).json({
      success: true,
      message: 'Database connection status',
      status,
      readyState: dbStatus
    });
  } catch (error) {
    console.error('Database status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking database status',
      error: error.message
    });
  }
});

// @desc    Debug course access
// @route   GET /api/debug/course-access/:id
// @access  Private
router.get('/course-access/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const isStudent = course.students.includes(req.user.id);
    const isFaculty = course.faculty.includes(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Course access check',
      course: {
        id: course._id,
        name: course.name,
        code: course.code
      },
      user: {
        id: req.user._id,
        role: req.user.role
      },
      access: {
        isStudent,
        isFaculty,
        isAdmin: req.user.role === 'admin',
        hasAccess: isStudent || isFaculty || req.user.role === 'admin'
      }
    });
  } catch (error) {
    console.error('Course access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking course access',
      error: error.message
    });
  }
});

// @desc    Debug user authentication
// @route   GET /api/debug/user-auth
// @access  Private
router.get('/user-auth', protect, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User authentication debug',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      token: req.headers.authorization ? 'Present' : 'Missing'
    });
  } catch (error) {
    console.error('User auth debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking user authentication',
      error: error.message
    });
  }
});

// @desc    Debug faculty permissions
// @route   GET /api/debug/faculty-permissions/:courseId
// @access  Private
router.get('/faculty-permissions/:courseId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    const isFaculty = course.faculty.some(
      faculty => faculty.toString() === req.user.id
    );
    
    res.status(200).json({
      success: true,
      message: 'Faculty permissions check',
      course: {
        id: course._id,
        name: course.name,
        code: course.code,
        faculty: course.faculty
      },
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      permissions: {
        isFaculty,
        isAdmin: req.user.role === 'admin',
        hasAccess: isFaculty || req.user.role === 'admin'
      }
    });
  } catch (error) {
    console.error('Faculty permissions check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking faculty permissions',
      error: error.message
    });
  }
});

// @desc    Debug authentication
// @route   GET /api/debug/auth-check
// @access  Private
router.get('/auth-check', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication check',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    },
    token: req.headers.authorization ? req.headers.authorization.split(' ')[1] : 'No token'
  });
});

module.exports = router; 