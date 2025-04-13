const Job = require('../models/Job');
const User = require('../models/User');
const JobApplication = require('../models/JobApplication');
const { clearCache } = require('../middleware/cache');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const { search, status, jobType, location, sort } = req.query;
    
    // Build query
    const query = {};
    
    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    } else {
      // By default, only show open jobs
      query.status = 'Open';
    }
    
    // Filter by job type
    if (jobType) {
      query.jobType = jobType;
    }
    
    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Only show jobs that haven't passed their deadline
    query.applicationDeadline = { $gte: new Date() };
    
    // Build sort object
    let sortOptions = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortOptions[field.substring(1)] = -1;
        } else {
          sortOptions[field] = 1;
        }
      });
    } else {
      // Default sort by createdAt descending
      sortOptions = { createdAt: -1 };
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Job.countDocuments(query);
    
    // Execute query
    const jobs = await Job.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
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
      count: jobs.length,
      pagination,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    // Find job by ID
    const job = await Job.findById(req.params.id)
      .populate({
        path: 'createdBy',
        select: 'name'
      });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Get applications count for this job
    const applicationsCount = await JobApplication.countDocuments({ job: job._id });
    
    res.status(200).json({
      success: true,
      data: {
        ...job.toObject(),
        applicationsCount
      }
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private/Placement/Admin
exports.createJob = async (req, res) => {
  try {
    // Add the user ID as the job creator
    req.body.createdBy = req.user.id;
    
    // Create the job
    const job = await Job.create(req.body);
    
    // Notify eligible students
    notifyEligibleStudents(job);
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private/Placement/Admin
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Make sure user is job creator or admin
    if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }
    
    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // Clear cache
    clearCache('/api/jobs');
    clearCache(`/api/jobs/${req.params.id}`);
    
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private/Placement/Admin
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Make sure user is job creator or admin
    if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }
    
    await job.deleteOne();
    
    // Clear cache
    clearCache('/api/jobs');
    clearCache(`/api/jobs/${req.params.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private/Student
exports.applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      cgpa,
      degree,
      batch,
      skills,
      experience,
      coverLetter,
      resumeLink
    } = req.body;
    
    // Find the job
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check if job is open
    if (job.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: 'This job is not accepting applications'
      });
    }
    
    // Check if application deadline has passed
    if (new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }
    
    // Check if user has already applied
    const existingApplication = await JobApplication.findOne({
      job: id,
      student: req.user.id
    });
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }
    
    // Create application
    const application = await JobApplication.create({
      job: id,
      student: req.user.id,
      name: name || req.user.name,
      email: email || req.user.email,
      cgpa,
      degree,
      batch,
      skills,
      experience,
      coverLetter,
      resumeLink
    });
    
    // Send notification to job creator
    try {
      const jobCreator = await User.findById(job.createdBy);
      if (jobCreator) {
        await sendEmail({
          email: jobCreator.email,
          subject: `New Application for ${job.title}`,
          message: `
            <h1>New Job Application</h1>
            <p>A new application has been submitted for the job: ${job.title}</p>
            <p><strong>Applicant:</strong> ${req.user.name}</p>
            <p><strong>Email:</strong> ${req.user.email}</p>
            <p><strong>Applied on:</strong> ${new Date().toLocaleDateString()}</p>
            <p>Login to view the full application details.</p>
          `
        });
      }
    } catch (error) {
      console.error('Error sending notification email:', error);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/jobs/:id/applications/:applicationId
// @access  Private/Placement/Admin
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }
    
    // Find the application by ID
    const application = await JobApplication.findById(req.params.applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if application belongs to the job
    if (application.job.toString() !== req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Application does not belong to this job'
      });
    }
    
    // Update application status
    application.status = status;
    
    // Add notes if provided
    if (notes) {
      application.notes = notes;
    }
    
    await application.save();
    
    // Send notification to student
    const student = await User.findById(application.student);
    const job = await Job.findById(application.job);
    
    if (student && student.email) {
      // Send email notification
      await sendEmail({
        email: student.email,
        subject: `Job Application Status Update - ${job.title}`,
        message: `
          <h3>Your application status has been updated</h3>
          <p>Job: ${job.title} at ${job.company}</p>
          <p>Status: ${status}</p>
          ${notes ? `<p>Notes: ${notes}</p>` : ''}
          <p>Login to your account to view more details.</p>
        `
      });
    }
    
    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all applications for a job
// @route   GET /api/jobs/:id/applications
// @access  Private/Placement/Admin
exports.getJobApplications = async (req, res) => {
  try {
    const jobId = req.params.id;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Get applications for this job
    const applications = await JobApplication.find({ job: jobId })
      .populate({
        path: 'student',
        select: 'name email profile'
      })
      .sort('-appliedAt');
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get student's job applications
// @route   GET /api/jobs/applications
// @access  Private/Student
exports.getStudentApplications = async (req, res) => {
  try {
    const jobs = await Job.find({
      'applicants.student': req.user.id
    }).select('title company location jobType status applicationDeadline applicants');
    
    // Extract only the user's application from each job
    const applications = jobs.map(job => {
      const application = job.applicants.find(
        app => app.student.toString() === req.user.id
      );
      
      return {
        job: {
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          jobType: job.jobType,
          status: job.status,
          applicationDeadline: job.applicationDeadline
        },
        status: application.status,
        appliedAt: application.appliedAt
      };
    });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching student applications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to notify eligible students
const notifyEligibleStudents = async (job) => {
  try {
    // Build query to find eligible students
    const query = { role: 'student' };
    
    // Add CGPA criteria if specified
    if (job.eligibility && job.eligibility.cgpa) {
      query['profile.cgpa'] = { $gte: job.eligibility.cgpa };
    }
    
    // Add degree criteria if specified
    if (job.eligibility && job.eligibility.degrees && job.eligibility.degrees.length > 0) {
      query['profile.degree'] = { $in: job.eligibility.degrees };
    }
    
    // Add batch criteria if specified
    if (job.eligibility && job.eligibility.batch && job.eligibility.batch.length > 0) {
      query['profile.batch'] = { $in: job.eligibility.batch };
    }
    
    // Find eligible students
    const students = await User.find(query).select('name email');
    
    console.log(`Found ${students.length} eligible students for job notification`);
    
    // Send email to each eligible student
    for (const student of students) {
      await sendEmail({
        email: student.email,
        subject: `New Job Opportunity: ${job.title} at ${job.company}`,
        message: `
          <p>Hello ${student.name},</p>
          <p>A new job opportunity matching your profile has been posted:</p>
          <h3>${job.title} at ${job.company}</h3>
          <p><strong>Location:</strong> ${job.location}</p>
          <p><strong>Job Type:</strong> ${job.jobType}</p>
          <p><strong>Application Deadline:</strong> ${new Date(job.applicationDeadline).toLocaleDateString()}</p>
          <p>Please login to the system to view more details and apply.</p>
        `
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error notifying students:', error);
    return false;
  }
};

// @desc    Export job applications to CSV
// @route   GET /api/jobs/:id/applications/export
// @access  Private/Placement/Admin
exports.exportApplicationsToCSV = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the job
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check authorization
    if (job.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access these applications'
      });
    }
    
    // Get applications for this job
    const applications = await JobApplication.find({ job: id })
      .sort('-appliedAt');
    
    // Format data for CSV
    const csvData = applications.map(app => ({
      'Student Name': app.name,
      'Email': app.email,
      'Applied On': new Date(app.appliedAt).toLocaleDateString(),
      'Status': app.status,
      'CGPA': app.cgpa || 'N/A',
      'Degree': app.degree || 'N/A',
      'Batch': app.batch || 'N/A',
      'Skills': app.skills?.join(', ') || 'N/A',
      'Resume Link': app.resumeLink || 'N/A',
      'Experience': app.experience || 'N/A',
      'Cover Letter': app.coverLetter || 'N/A'
    }));
    
    // Convert to CSV
    const { Parser } = require('json2csv');
    const fields = Object.keys(csvData[0] || {});
    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${job.title}-applications.csv"`);
    
    // Send the CSV data
    res.send(csv);
    
  } catch (error) {
    console.error('Error exporting applications to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get job statistics
// @route   GET /api/jobs/stats
// @access  Private/Placement/Admin
exports.getJobStats = async (req, res) => {
  try {
    // Get total jobs count
    const totalJobs = await Job.countDocuments();
    
    // Get active jobs count (status = Open)
    const activeJobs = await Job.countDocuments({ status: 'Open' });
    
    // Get total applications count
    const totalApplications = await JobApplication.countDocuments();
    
    // Get pending applications count
    const pendingApplications = await JobApplication.countDocuments({ status: 'Pending' });
    
    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications
      }
    });
  } catch (error) {
    console.error('Error getting job stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports; 