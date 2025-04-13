const express = require('express');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getProfessorAssignments
} = require('../controllers/assignmentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');

// Import submission routes
const submissionRoutes = require('./submissionRoutes');

// Use submission routes for /:assignmentId/submissions
router.use('/:assignmentId/submissions', submissionRoutes);

// Faculty route
router.get('/faculty', protect, authorize('faculty', 'admin'), getProfessorAssignments);

// Assignment routes
router.route('/')
  .get(protect, cacheMiddleware(300), getAssignments)
  .post(protect, authorize('faculty', 'admin'), createAssignment);

router.route('/:id')
  .get(protect, cacheMiddleware(300), getAssignment)
  .put(protect, authorize('faculty', 'admin'), updateAssignment)
  .delete(protect, authorize('faculty', 'admin'), deleteAssignment);

module.exports = router; 