const Course = require('../models/Course');
const User = require('../models/User');
const { clearCache } = require('../middleware/cache');

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  try {
    console.log('Creating course, request body:', req.body);
    
    // Add the user ID as the creator
    req.body.createdBy = req.user.id;
    
    const course = await Course.create(req.body);
    
    // Clear all relevant caches
    clearCache('/api/courses');
    clearCache('/api/courses?page=1&limit=10');
    
    console.log('Course created successfully:', course);
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Course with that code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const total = await Course.countDocuments();
    
    // Get courses
    const courses = await Course.find()
      .populate({
        path: 'faculty',
        select: 'name'
      })
      .sort('name')
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
      count: courses.length,
      pagination,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'faculty',
        select: 'name email'
      })
      .populate({
        path: 'students',
        select: 'name email'
      });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
  try {
    console.log('Updating course with ID:', req.params.id);
    console.log('Update data:', req.body);
    
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check for duplicate code if code is being changed
    if (req.body.code && req.body.code !== course.code) {
      const existingCourse = await Course.findOne({ code: req.body.code });
      
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: 'Course with this code already exists'
        });
      }
    }
    
    course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Clear cache
    clearCache('/api/courses');
    clearCache(`/api/courses/${req.params.id}`);
    
    console.log('Course updated successfully:', course);
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Course with that code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Remove course from all users' enrolledCourses
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    );
    
    await course.deleteOne();
    
    // Clear cache
    clearCache('/api/courses');
    clearCache(`/api/courses/${req.params.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add faculty to course
// @route   POST /api/courses/:id/faculty
// @access  Private/Admin
exports.addFaculty = async (req, res) => {
  try {
    const { facultyId } = req.body;
    
    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide faculty ID'
      });
    }
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if faculty exists
    const faculty = await User.findById(facultyId);
    
    if (!faculty || (faculty.role !== 'faculty' && faculty.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }
    
    // Check if faculty is already assigned to course
    if (course.faculty.includes(facultyId)) {
      return res.status(400).json({
        success: false,
        message: 'Faculty already assigned to this course'
      });
    }
    
    course.faculty.push(facultyId);
    await course.save();
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Add faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get course faculty
// @route   GET /api/courses/:id/faculty
// @access  Private
exports.getCourseFaculty = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'faculty',
        select: 'name email'
      });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user is authorized to view this course
    const isStudent = course.students.includes(req.user.id);
    const isFaculty = course.faculty.some(f => f._id.toString() === req.user.id);
    
    if (!isStudent && !isFaculty && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this course'
      });
    }
    
    res.status(200).json({
      success: true,
      data: course.faculty
    });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Remove faculty from course
// @route   DELETE /api/courses/:id/faculty/:facultyId
// @access  Private/Admin
exports.removeFaculty = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if faculty is assigned to course
    if (!course.faculty.includes(req.params.facultyId)) {
      return res.status(400).json({
        success: false,
        message: 'Faculty not assigned to this course'
      });
    }
    
    course.faculty = course.faculty.filter(
      faculty => faculty.toString() !== req.params.facultyId
    );
    
    await course.save();
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add student to course
// @route   POST /api/courses/:id/students
// @access  Private/Admin
exports.addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide student ID'
      });
    }
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if student exists
    const student = await User.findById(studentId);
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Check if student is already enrolled in course
    if (course.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student already enrolled in this course'
      });
    }
    
    course.students.push(studentId);
    await course.save();
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get course students
// @route   GET /api/courses/:id/students
// @access  Private
exports.getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'students',
        select: 'name email'
      });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: course.students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Remove student from course
// @route   DELETE /api/courses/:id/students/:studentId
// @access  Private/Admin
exports.removeStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if student is enrolled in course
    if (!course.students.includes(req.params.studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Student not enrolled in this course'
      });
    }
    
    course.students = course.students.filter(
      student => student.toString() !== req.params.studentId
    );
    
    await course.save();
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 