const Resource = require('../models/Resource');
const Course = require('../models/Course');
const { safeClearCache } = require('../utils/cacheUtils');
const { clearCache } = require('../middleware/cache');
const mongoose = require('mongoose');

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private/Faculty
exports.createResource = async (req, res) => {
  try {
    console.log('Creating resource, request body:', JSON.stringify(req.body, null, 2));
    console.log('User info:', req.user ? { 
      id: req.user.id, 
      role: req.user.role,
      name: req.user.name,
      email: req.user.email
    } : 'No user');
    
    const { title, description, course, resourceType, fileUrl, externalLink } = req.body;
    
    // Validate required fields
    if (!title || !description || !course || !resourceType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Check if course exists
    const courseExists = await Course.findById(course);
    
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user is faculty for this course
    const isFaculty = courseExists.faculty.some(
      faculty => faculty.toString() === req.user.id
    );
    
    console.log('Is faculty for course:', isFaculty);
    console.log('User ID:', req.user.id);
    console.log('Course faculty:', courseExists.faculty);
    
    // Allow faculty or admin to create resources
    if (!isFaculty && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create resources for this course'
      });
    }
    
    // Create resource
    const resourceData = {
      title,
      description,
      course,
      resourceType,
      createdBy: req.user.id
    };
    
    // Add optional fields based on resource type
    if (resourceType === 'document' || resourceType === 'video') {
      resourceData.fileUrl = fileUrl || '';
    } else if (resourceType === 'link') {
      resourceData.externalLink = externalLink || '';
    }
    
    console.log('Creating resource with data:', JSON.stringify(resourceData, null, 2));
    
    const resource = await Resource.create(resourceData);
    console.log('Resource created successfully:', resource._id);
    
    // Add resource to course
    courseExists.resources.push(resource._id);
    await courseExists.save();
    console.log('Resource added to course successfully');
    
    // Clear cache
    safeClearCache('/api/resources');
    
    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Create resource error details:', error);
    console.error('Error stack:', error.stack);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    // Check for duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate field value entered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
exports.getResources = async (req, res) => {
  try {
    // Build query
    let query = {};
    
    // Filter by course if provided
    if (req.query.course) {
      console.log('Filtering resources by course:', req.query.course);
      query.course = req.query.course;
    }
    
    // Filter by resource type if provided
    if (req.query.resourceType) {
      query.resourceType = req.query.resourceType;
    }
    
    console.log('Resource query:', JSON.stringify(query));
    
    // Execute query
    const resources = await Resource.find(query)
      .sort('-createdAt')
      .populate({
        path: 'createdBy',
        select: 'name email'
      });
    
    console.log(`Found ${resources.length} resources matching query`);
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get resources for a course
// @route   GET /api/courses/:id/resources
// @access  Private
exports.getCourseResources = async (req, res) => {
  try {
    console.log(`Getting resources for course: ${req.params.id}`);
    
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
        message: 'Not authorized to access resources for this course'
      });
    }
    
    // Get resources for the course
    const resources = await Resource.find({ course: req.params.id })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${resources.length} resources for course ${req.params.id}`);
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error fetching course resources:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
exports.getResource = async (req, res) => {
  try {
    console.log('Getting resource by ID:', req.params.id);
    
    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resource ID format'
      });
    }
    
    const resource = await Resource.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('course', 'name code');
    
    if (!resource) {
      console.log('Resource not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    console.log('Found resource:', {
      id: resource._id,
      title: resource.title,
      type: resource.type || resource.resourceType
    });
    
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error fetching resource by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private/Professor
exports.updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Make sure user is the resource creator
    if (resource.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this resource'
      });
    }
    
    resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    // Clear cache
    safeClearCache('/api/resources');
    safeClearCache(`/api/resources/${req.params.id}`);
    
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private/Professor
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Make sure user is the resource creator
    if (resource.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }
    
    await resource.deleteOne();
    
    // Clear cache
    safeClearCache('/api/resources');
    safeClearCache(`/api/resources/${req.params.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get resources created by professor
// @route   GET /api/resources/professor
// @access  Private/Professor
exports.getProfessorResources = async (req, res) => {
  try {
    const resources = await Resource.find({ createdBy: req.user.id })
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a resource for a course
// @route   POST /api/courses/:id/resources
// @access  Private/Faculty/Admin
exports.createResourceForCourse = async (req, res) => {
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
        message: 'Not authorized to add resources to this course'
      });
    }
    
    // Create the resource
    const resource = await Resource.create({
      ...req.body,
      course: id,
      createdBy: req.user.id
    });
    
    // Clear cache
    clearCache(`/api/courses/${id}/resources`);
    
    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 