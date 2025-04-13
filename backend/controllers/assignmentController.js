const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const User = require('../models/User');
const { clearCache } = require('../middleware/cache');
const mongoose = require('mongoose');

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private/Faculty
exports.createAssignment = async (req, res) => {
  try {
    console.log('Creating assignment, request body:', JSON.stringify(req.body, null, 2));
    console.log('User info:', req.user ? { 
      id: req.user.id, 
      role: req.user.role,
      name: req.user.name
    } : 'No user');
    
    // Extract all possible fields
    const { title, description, course, dueDate, points, totalMarks, attachments } = req.body;
    
    // Validate required fields
    if (!title || !description || !course || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
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
    
    // Check if user is faculty for this course or admin
    const isFaculty = courseExists.faculty.some(faculty => 
      faculty.toString() === req.user.id.toString()
    );
    const isAdmin = req.user.role === 'admin';
    
    if (!isFaculty && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add assignments to this course'
      });
    }
    
    // Determine the points value
    const assignmentPoints = points !== undefined ? points : (totalMarks !== undefined ? totalMarks : 100);
    
    console.log('Using points value:', assignmentPoints);
    
    // Create the assignment data
    const assignmentData = {
      title,
      description,
      course,
      dueDate,
      points: assignmentPoints,
      createdBy: req.user.id
    };
    
    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      assignmentData.attachments = attachments;
    }
    
    console.log('Final assignment data:', assignmentData);
    
    // Create the assignment
    const assignment = await Assignment.create(assignmentData);
    
    // Add assignment to course
    courseExists.assignments.push(assignment._id);
    await courseExists.save();
    
    // Clear cache
    clearCache('/api/assignments');
    clearCache(`/api/courses/${course}/assignments`);
    
    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    let query = {};
    
    // Filter by course
    if (req.query.course) {
      query.course = req.query.course;
    }
    
    // If user is a student, only show assignments from their courses
    if (req.user.role === 'student') {
      const courses = await Course.find({ students: req.user.id });
      const courseIds = courses.map(course => course._id);
      
      query.course = { $in: courseIds };
    }
    
    // If user is faculty, only show assignments from their courses
    if (req.user.role === 'faculty') {
      const courses = await Course.find({ faculty: req.user.id });
      const courseIds = courses.map(course => course._id);
      
      query.course = { $in: courseIds };
    }
    
    const assignments = await Assignment.find(query)
      .populate('course', 'name code')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get assignments for a course
// @route   GET /api/courses/:id/assignments
// @access  Private
exports.getCourseAssignments = async (req, res) => {
  try {
    console.log(`Getting assignments for course: ${req.params.id}`);
    
    // Check if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }
    
    // Verify the course exists
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user is enrolled or is faculty or admin
    const isEnrolled = course.students.some(student => 
      student.toString() === req.user.id.toString()
    );
    const isFaculty = course.faculty.some(faculty => 
      faculty.toString() === req.user.id.toString()
    );
    const isAdmin = req.user.role === 'admin';
    
    if (!isEnrolled && !isFaculty && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access assignments for this course'
      });
    }
    
    // Get assignments for the course
    const assignments = await Assignment.find({ course: req.params.id })
      .sort({ dueDate: 1 });
    
    console.log(`Found ${assignments.length} assignments for course ${req.params.id}`);
    
    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching course assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate({
      path: 'createdBy',
      select: 'name'
    });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Faculty
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, course, dueDate, totalMarks, attachments } = req.body;
    
    console.log('Updating assignment:', id);
    console.log('Update data:', req.body);
    
    // Find the assignment
    let assignment = await Assignment.findById(id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check if user is the creator or admin
    if (assignment.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment'
      });
    }
    
    // If course is being changed, verify the new course exists and user is faculty
    if (course && course !== assignment.course.toString()) {
      const newCourse = await Course.findById(course);
      
      if (!newCourse) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
      
      // Check if user is faculty for the new course
      const isFaculty = newCourse.faculty.some(faculty => 
        faculty.toString() === req.user.id.toString()
      ) || req.user.role === 'admin';
      
      if (!isFaculty) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create assignments for this course'
        });
      }
      
      // Remove assignment from old course using findByIdAndUpdate
      await Course.findByIdAndUpdate(
        assignment.course,
        { $pull: { assignments: id } },
        { runValidators: false }
      );
      
      // Add assignment to new course using findByIdAndUpdate
      await Course.findByIdAndUpdate(
        course,
        { $push: { assignments: id } },
        { runValidators: false }
      );
    }
    
    // Prepare update data
    const updateData = {
      title,
      description,
      course,
      dueDate,
      totalMarks,
      attachments
    };
    
    console.log('Final update data:', updateData);
    
    // Update assignment
    assignment = await Assignment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log('Updated assignment:', assignment);
    
    // Clear cache
    clearCache('/api/assignments');
    clearCache(`/api/assignments/${id}`);
    clearCache(`/api/courses/${assignment.course}/assignments`);
    if (course && course !== assignment.course.toString()) {
      clearCache(`/api/courses/${course}/assignments`);
    }
    
    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Professor
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Make sure user is the assignment creator
    if (assignment.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this assignment'
      });
    }
    
    // Delete all submissions for this assignment
    await Submission.deleteMany({ assignment: req.params.id });
    
    // Delete the assignment
    await assignment.deleteOne();
    
    // Clear cache
    clearCache('/api/assignments');
    clearCache(`/api/assignments/${req.params.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get assignments created by professor
// @route   GET /api/assignments/professor
// @access  Private/Professor
exports.getProfessorAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user.id })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create an assignment for a course
// @route   POST /api/courses/:id/assignments
// @access  Private/Faculty/Admin
exports.createAssignmentForCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify the course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user is faculty for this course or admin
    const isFaculty = course.faculty.includes(req.user.id);
    const isAdmin = req.user.role === 'admin';
    
    if (!isFaculty && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add assignments to this course'
      });
    }
    
    // Create the assignment
    const assignment = await Assignment.create({
      ...req.body,
      course: id,
      createdBy: req.user.id
    });
    
    // Clear cache
    clearCache(`/api/courses/${id}/assignments`);
    
    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 