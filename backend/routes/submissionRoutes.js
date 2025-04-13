const express = require('express');
const {
  submitAssignment,
  getSubmissions,
  getStudentSubmission,
  gradeSubmission,
  getSubmission
} = require('../controllers/submissionController');

// Important: Use mergeParams to get access to parent router params
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../middleware/auth');

// Create and get submissions
router.route('/')
  .get(protect, authorize('faculty', 'admin'), getSubmissions)
  .post(protect, authorize('student'), submitAssignment);

// Get student's own submission
router.get('/student', protect, authorize('student'), getStudentSubmission);

// Grade submission
router.put('/:id/grade', protect, authorize('faculty', 'admin'), gradeSubmission);

// Get a single submission
router.get('/:id', protect, getSubmission);

module.exports = router; 