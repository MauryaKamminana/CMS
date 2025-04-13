const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Course = require('../models/Course');
const { clearCache } = require('../middleware/cache');
const { Parser } = require('json2csv');
const mongoose = require('mongoose');

// @desc    Get attendance records for a course
// @route   GET /api/courses/:id/attendance
// @access  Private
exports.getCourseAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, format } = req.query;
    
    // Verify the course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Build query
    const query = { course: id };
    
    // Add date filters if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: start,
        $lte: end
      };
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.date = { $gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $lte: end };
    }
    
    // For students, only show their own attendance
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }
    
    // Get attendance records
    const attendance = await Attendance.find(query)
      .populate('student', 'name email')
      .sort({ date: -1 });
    
    // If format is 'summary', group by date and provide summary statistics
    if (format === 'summary') {
      // Get all students in the course
      const courseStudents = await Course.findById(id).select('students');
      const totalStudents = courseStudents.students.length;
      
      // Group attendance by date
      const attendanceByDate = {};
      
      attendance.forEach(record => {
        const dateStr = record.date.toISOString().split('T')[0];
        
        if (!attendanceByDate[dateStr]) {
          attendanceByDate[dateStr] = {
            date: dateStr,
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            percentage: 0
          };
        }
        
        attendanceByDate[dateStr].total++;
        attendanceByDate[dateStr][record.status]++;
      });
      
      // Calculate percentages
      Object.values(attendanceByDate).forEach(day => {
        day.percentage = Math.round((day.present / totalStudents) * 100);
      });
      
      // Convert to array and sort by date
      const summaryData = Object.values(attendanceByDate).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      return res.status(200).json({
        success: true,
        totalStudents,
        count: summaryData.length,
        data: summaryData
      });
    }
    
    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get student's attendance for all courses
// @route   GET /api/attendance/student
// @access  Private/Student
exports.getStudentAttendance = async (req, res) => {
  try {
    // Get all courses the student is enrolled in
    const courses = await Course.find({ students: req.user.id })
      .select('name code');
    
    // Get attendance for each course
    const attendanceByCourse = [];
    
    for (const course of courses) {
      const attendance = await Attendance.find({
        course: course._id,
        student: req.user.id
      }).sort({ date: -1 });
      
      // Calculate statistics
      const stats = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        excused: attendance.filter(a => a.status === 'excused').length
      };
      
      // Calculate attendance percentage
      stats.percentage = stats.total > 0 
        ? Math.round((stats.present / stats.total) * 100) 
        : 0;
      
      attendanceByCourse.push({
        course: {
          id: course._id,
          name: course.name,
          code: course.code
        },
        stats,
        records: attendance
      });
    }
    
    res.status(200).json({
      success: true,
      count: attendanceByCourse.length,
      data: attendanceByCourse
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark attendance for a course
// @route   POST /api/courses/:id/attendance
// @access  Private/Faculty
exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, students } = req.body;
    
    console.log('Marking attendance:', {
      courseId: id,
      date,
      studentsCount: students?.length || 0
    });
    
    if (!date || !students || !Array.isArray(students)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date and students array'
      });
    }
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required'
      });
    }
    
    // Validate course
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user is faculty for this course
    const isFaculty = course.faculty.some(faculty => 
      faculty.toString() === req.user.id.toString()
    ) || req.user.role === 'admin';
    
    if (!isFaculty) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark attendance for this course'
      });
    }
    
    // Parse date string to Date object and normalize to start of day
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    
    // First, check if there are any existing attendance records with the problematic index
    // This is a workaround for the duplicate key error
    try {
      // Try to find any attendance record for this course and date
      const existingRecord = await Attendance.findOne({
        course: id,
        date: attendanceDate
      });
      
      // If a record exists and doesn't have a student field, delete it
      if (existingRecord && !existingRecord.student) {
        console.log('Found problematic record without student field, deleting:', existingRecord._id);
        await Attendance.deleteOne({ _id: existingRecord._id });
      }
    } catch (error) {
      console.error('Error checking for problematic records:', error);
      // Continue with the process even if this check fails
    }
    
    // Process each student's attendance individually to avoid bulk write errors
    const results = {
      updated: 0,
      created: 0,
      failed: 0,
      details: []
    };
    
    for (const student of students) {
      try {
        // Find existing attendance record
        const existingRecord = await Attendance.findOne({
          course: id,
          student: student.id,
          date: attendanceDate
        });
        
        if (existingRecord) {
          // Update existing record
          existingRecord.status = student.status;
          existingRecord.faculty = req.user.id;
          await existingRecord.save();
          results.updated++;
          results.details.push({
            student: student.id,
            status: 'updated',
            record: existingRecord._id
          });
        } else {
          // Create new record
          const newRecord = await Attendance.create({
            course: id,
            student: student.id,
            status: student.status,
            date: attendanceDate,
            faculty: req.user.id
          });
          results.created++;
          results.details.push({
            student: student.id,
            status: 'created',
            record: newRecord._id
          });
        }
      } catch (error) {
        console.error(`Error processing attendance for student ${student.id}:`, error);
        
        // If it's a duplicate key error with the problematic index
        if (error.code === 11000 && error.keyPattern && 
            error.keyPattern.course === 1 && 
            error.keyPattern.date === 1 && 
            !error.keyPattern.student) {
          
          console.log('Detected problematic index error, attempting to fix...');
          
          try {
            // Try to delete any records with the problematic index
            await Attendance.deleteMany({
              course: id,
              date: attendanceDate,
              student: { $exists: false }
            });
            
            // Try again to create the record
            const newRecord = await Attendance.create({
              course: id,
              student: student.id,
              status: student.status,
              date: attendanceDate,
              faculty: req.user.id
            });
            
            results.created++;
            results.details.push({
              student: student.id,
              status: 'created-retry',
              record: newRecord._id
            });
            
            // Skip to the next iteration
            continue;
          } catch (retryError) {
            console.error('Retry failed:', retryError);
          }
        }
        
        results.failed++;
        results.details.push({
          student: student.id,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    console.log('Attendance marking results:', {
      updated: results.updated,
      created: results.created,
      failed: results.failed
    });
    
    // Clear cache
    clearCache(`/api/courses/${id}/attendance`);
    
    res.status(200).json({
      success: true,
      message: `Attendance marked successfully. Updated: ${results.updated}, Created: ${results.created}, Failed: ${results.failed}`,
      data: results
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get faculty's courses for attendance
// @route   GET /api/attendance/faculty/courses
// @access  Private/Faculty
exports.getFacultyCourses = async (req, res) => {
  try {
    console.log('Getting faculty courses for user:', req.user.id);
    
    // Find courses where the user is a faculty member
    const courses = await Course.find({
      faculty: req.user.id
    }).select('name code description');
    
    console.log('Found courses:', courses.length);
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching faculty courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendanceRecords = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Build query
    let query = {};
    
    // Filter by course
    if (req.query.course) {
      query.course = req.query.course;
    }
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    const total = await Attendance.countDocuments(query);
    
    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'course',
        select: 'name code'
      })
      .populate({
        path: 'faculty',
        select: 'name'
      })
      .sort('-date')
      .skip(startIndex)
      .limit(limit);
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      pagination,
      data: attendanceRecords
    });
  } catch (error) {
    console.error('Error getting attendance records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
exports.getAttendanceRecord = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate({
        path: 'course',
        select: 'name code'
      })
      .populate({
        path: 'faculty',
        select: 'name'
      })
      .populate({
        path: 'students.student',
        select: 'name'
      });
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error getting attendance record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Admin/Faculty
exports.updateAttendance = async (req, res) => {
  try {
    const { students } = req.body;
    
    if (!students) {
      return res.status(400).json({
        success: false,
        message: 'Please provide students data'
      });
    }
    
    let attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    // Check if user is authorized
    if (attendance.faculty.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this attendance record'
      });
    }
    
    // Update attendance
    attendance.students = students;
    await attendance.save();
    
    // Clear cache
    clearCache('/api/attendance');
    
    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Admin/Faculty
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    // Check if user is authorized
    if (attendance.faculty.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this attendance record'
      });
    }
    
    await attendance.deleteOne();
    
    // Clear cache
    clearCache('/api/attendance');
    
    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export attendance as CSV
// @route   GET/POST /api/attendance/export
// @access  Private/Admin/Faculty
exports.exportAttendance = async (req, res) => {
  try {
    // Get parameters from either query (GET) or body (POST)
    const params = req.method === 'POST' ? req.body : req.query;
    console.log(`Export attendance ${req.method} request:`, params);
    
    const { course, startDate, endDate } = params;
    
    if (!course || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course, start date, and end date'
      });
    }
    
    // Verify the course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    console.log(`Found course: ${courseExists.name} (${courseExists.code})`);
    console.log(`Students in course: ${courseExists.students.length}`);
    
    // Check if user is faculty for this course or admin
    const isFaculty = courseExists.faculty.some(faculty => 
      faculty.toString() === req.user.id.toString()
    );
    const isAdmin = req.user.role === 'admin';
    
    if (!isFaculty && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to export attendance for this course'
      });
    }
    
    // Get all students in the course
    const students = await User.find({ 
      _id: { $in: courseExists.students } 
    }).select('name email');
    
    console.log(`Found ${students.length} students in the course`);
    
    // Create a map of student IDs to names for quick lookup
    const studentMap = {};
    students.forEach(student => {
      if (student && student._id) {
        studentMap[student._id.toString()] = {
          name: student.name,
          email: student.email
        };
      }
    });
    
    // Get attendance records for the date range
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    
    console.log(`Searching for attendance records between ${startDateObj.toISOString()} and ${endDateObj.toISOString()}`);
    
    // Get attendance records for the date range with faculty information
    const attendanceRecords = await Attendance.find({
      course: course,
      date: {
        $gte: startDateObj,
        $lte: endDateObj
      }
    }).populate('faculty', 'name').populate('student', 'name email');
    
    console.log(`Found ${attendanceRecords.length} attendance records`);
    
    // If no records found, create a sample CSV with all students marked as N/A
    if (attendanceRecords.length === 0) {
      console.log('No attendance records found, creating sample CSV');
      
      // Format for flat CSV structure (one record per line)
      // Create CSV header
      let csv = 'Date,Student Name,Email,Marked By,Status\n';
      
      // Add each student as a row with N/A status
      students.forEach(student => {
        const date = startDate;
        csv += `"${date}","${student.name}","${student.email}","N/A","N/A"\n`;
      });
      
      // Set response headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="attendance_${courseExists.code}_${startDate}_to_${endDate}.csv"`);
      
      // Send CSV data
      return res.status(200).send(csv);
    }
    
    // Format for flat CSV structure (one record per line)
    // Create CSV header
    let csv = 'Date,Student Name,Email,Marked By,Status\n';
    
    // Add each attendance record as a row
    attendanceRecords.forEach(record => {
      // Use either the populated student or the lookup from studentMap
      let studentName, studentEmail;
      
      if (record.student && typeof record.student === 'object') {
        // Student is populated
        studentName = record.student.name;
        studentEmail = record.student.email;
      } else if (record.student && studentMap[record.student.toString()]) {
        // Use the map
        const student = studentMap[record.student.toString()];
        studentName = student.name;
        studentEmail = student.email;
      } else {
        console.log(`Skipping record ${record._id} - student not found`);
        return; // Skip if student not found
      }
      
      const date = record.date.toISOString().split('T')[0];
      const facultyName = record.faculty && record.faculty.name ? record.faculty.name : 'Unknown';
      const status = record.status.charAt(0).toUpperCase() + record.status.slice(1); // Capitalize status
      
      csv += `"${date}","${studentName}","${studentEmail}","${facultyName}","${status}"\n`;
    });
    
    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_${courseExists.code}_${startDate}_to_${endDate}.csv"`);
    
    // Send CSV data
    res.status(200).send(csv);
    
  } catch (error) {
    console.error('Error exporting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 