const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const jobController = require('../controllers/jobController');

// Base routes
router.route('/')
  .get(jobController.getJobs)
  .post(protect, authorize('placement', 'admin'), jobController.createJob);

// Get job statistics - MUST come BEFORE /:id routes
router.get('/stats', protect, authorize('placement', 'admin'), jobController.getJobStats);

// Student applications
router.route('/applications')
  .get(protect, authorize('student'), jobController.getStudentApplications);

// Single job routes
router.route('/:id')
  .get(jobController.getJob)
  .put(protect, authorize('placement', 'admin'), jobController.updateJob)
  .delete(protect, authorize('placement', 'admin'), jobController.deleteJob);

// Job application routes
router.route('/:id/apply')
  .post(protect, authorize('student'), jobController.applyForJob);

router.route('/:id/applications')
  .get(protect, authorize('placement', 'admin'), jobController.getJobApplications);

router.route('/:id/applications/:applicationId')
  .put(protect, authorize('placement', 'admin'), jobController.updateApplicationStatus);

router.get('/:id/applications/export', protect, authorize('placement', 'admin'), jobController.exportApplicationsToCSV);

module.exports = router; 