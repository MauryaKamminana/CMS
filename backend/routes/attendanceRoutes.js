const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');
const {
  getCourseAttendance,
  markAttendance,
  getStudentAttendance,
  getFacultyCourses
} = require('../controllers/attendanceController');

// Base routes
router.route('/')
  .get(protect, attendanceController.getAttendanceRecords)
  .post(protect, authorize('admin', 'faculty'), attendanceController.markAttendance);

// Export attendance
router.route('/export')
  .get(protect, authorize('admin', 'faculty'), attendanceController.exportAttendance)
  .post(protect, authorize('admin', 'faculty'), attendanceController.exportAttendance);

router.route('/student')
  .get(protect, attendanceController.getStudentAttendance);

router.route('/:id')
  .get(protect, attendanceController.getAttendanceRecord)
  .put(protect, authorize('admin', 'faculty'), attendanceController.updateAttendance)
  .delete(protect, authorize('admin', 'faculty'), attendanceController.deleteAttendance);

// Get student's attendance across all courses
router.get('/student', protect, authorize('student'), getStudentAttendance);

// Get faculty's courses for attendance
router.get('/faculty/courses', protect, authorize('faculty', 'admin'), getFacultyCourses);

module.exports = router; 