const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const { clearCache } = require('../middleware/cache');

// @desc    Submit assignment
// @route   POST /api/assignments/:assignmentId/submissions
// @access  Private/Student
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check if due date has passed
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    // Check if student has already submitted
    const existingSubmission = await Submission.findOne({
      assignment: req.params.assignmentId,
      student: req.user.id
    });
    
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment'
      });
    }
    
    // Create submission
    const submission = await Submission.create({
      assignment: req.params.assignmentId,
      student: req.user.id,
      submissionText: req.body.submissionText,
      attachments: req.body.attachments,
      status: now > dueDate ? 'late' : 'submitted'
    });
    
    // Clear cache
    clearCache(`/api/assignments/${req.params.assignmentId}/submissions`);
    
    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all submissions for an assignment
// @route   GET /api/assignments/:assignmentId/submissions
// @access  Private/Professor
exports.getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    
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
        message: 'Not authorized to view these submissions'
      });
    }
    
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate({
        path: 'student',
        select: 'name email'
      })
      .sort('-submittedAt');
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get student's submission for an assignment
// @route   GET /api/assignments/:assignmentId/submissions/student
// @access  Private/Student
exports.getStudentSubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.assignmentId,
      student: req.user.id
    });
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Grade a submission
// @route   PUT /api/assignments/:assignmentId/submissions/:id/grade
// @access  Private/Faculty
exports.gradeSubmission = async (req, res) => {
  try {
    console.log('Grading submission, user role:', req.user.role);
    
    // Check if user has permission (admin or faculty)
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      console.log('Permission denied: User role is', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to grade submissions'
      });
    }
    
    const { marks, feedback } = req.body;
    const { id, assignmentId } = req.params;

    // Validate marks (must be a number)
    if (isNaN(marks)) {
      return res.status(400).json({
        success: false,
        message: 'Marks must be a number'
      });
    }

    // Find the assignment to get total marks
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Make sure marks are within range
    if (marks < 0 || marks > assignment.totalMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${assignment.totalMarks}`
      });
    }

    // Update the submission
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Make sure the submission is for the correct assignment
    if (submission.assignment.toString() !== assignmentId) {
      return res.status(400).json({
        success: false,
        message: 'Submission does not belong to the specified assignment'
      });
    }

    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = Date.now();
    submission.gradedBy = req.user.id;

    await submission.save();

    // Clear cache
    await clearCache(`/api/assignments/${assignmentId}/submissions`);
    await clearCache(`/api/assignments/${assignmentId}/submissions/student`);

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all submissions by a student
// @route   GET /api/submissions/student
// @access  Private/Student
exports.getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate({
        path: 'assignment',
        select: 'title course dueDate totalMarks'
      })
      .sort('-submittedAt');
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get a single submission
// @route   GET /api/assignments/:assignmentId/submissions/:id
// @access  Private
exports.getSubmission = async (req, res) => {
  try {
    const { assignmentId, id } = req.params;
    
    // Find the submission
    const submission = await Submission.findById(id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Check if the submission is for the correct assignment
    if (submission.assignment.toString() !== assignmentId) {
      return res.status(400).json({
        success: false,
        message: 'Submission does not belong to the specified assignment'
      });
    }
    
    // Check if the user has permission to view this submission
    if (
      // Student can only view their own submission
      (req.user.role === 'student' && submission.student.toString() !== req.user.id) &&
      // Faculty/admin can view any submission
      (req.user.role !== 'faculty' && req.user.role !== 'admin')
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this submission'
      });
    }
    
    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error getting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 