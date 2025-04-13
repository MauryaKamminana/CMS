const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const courseController = require('../controllers/courseController');
const assignmentController = require('../controllers/assignmentController');
const resourceController = require('../controllers/resourceController');
const attendanceController = require('../controllers/attendanceController');

// Base routes
router.route('/')
  .get(protect, cacheMiddleware(300), courseController.getCourses)
  .post(protect, authorize('admin'), courseController.createCourse);

router.route('/:id')
  .get(protect, courseController.getCourse)
  .put(protect, authorize('admin'), courseController.updateCourse)
  .delete(protect, authorize('admin'), courseController.deleteCourse);

// Faculty routes
router.route('/:id/faculty')
  .get(protect, courseController.getCourseFaculty)
  .post(protect, authorize('admin'), courseController.addFaculty);

router.route('/:id/faculty/:facultyId')
  .delete(protect, authorize('admin'), courseController.removeFaculty);

// Student routes
router.route('/:id/students')
  .get(protect, courseController.getCourseStudents)
  .post(protect, authorize('admin', 'faculty'), courseController.addStudent);

router.route('/:id/students/:studentId')
  .delete(protect, authorize('admin', 'faculty'), courseController.removeStudent);

// Assignment routes
router.route('/:id/assignments')
  .get(protect, assignmentController.getCourseAssignments)
  .post(protect, authorize('faculty', 'admin'), assignmentController.createAssignment);

// Resource routes
router.route('/:id/resources')
  .get(protect, resourceController.getCourseResources)
  .post(protect, authorize('faculty', 'admin'), resourceController.createResource);

// Attendance routes
router.route('/:id/attendance')
  .get(protect, attendanceController.getCourseAttendance)
  .post(protect, authorize('faculty', 'admin'), attendanceController.markAttendance);

module.exports = router; 