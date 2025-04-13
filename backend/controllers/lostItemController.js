const LostItem = require('../models/LostItem');

// @desc    Create new lost item
// @route   POST /api/lost-items
// @access  Private
exports.createLostItem = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    const lostItem = await LostItem.create(req.body);
    
    res.status(201).json({
      success: true,
      data: lostItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all lost items
// @route   GET /api/lost-items
// @access  Public
exports.getLostItems = async (req, res) => {
  try {
    // Build query
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = LostItem.find(JSON.parse(queryStr)).populate({
      path: 'user',
      select: 'name'
    });
    
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await LostItem.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const lostItems = await query;
    
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
      count: lostItems.length,
      pagination,
      data: lostItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single lost item
// @route   GET /api/lost-items/:id
// @access  Public
exports.getLostItem = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id).populate({
      path: 'user',
      select: 'name'
    });
    
    if (!lostItem) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: lostItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update lost item
// @route   PUT /api/lost-items/:id
// @access  Private
exports.updateLostItem = async (req, res) => {
  try {
    let lostItem = await LostItem.findById(req.params.id);
    
    if (!lostItem) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found'
      });
    }
    
    // Make sure user is the owner
    if (lostItem.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }
    
    // Update lost item
    lostItem = await LostItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: lostItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete lost item
// @route   DELETE /api/lost-items/:id
// @access  Private
exports.deleteLostItem = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    
    if (!lostItem) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found'
      });
    }
    
    // Make sure user is the owner
    if (lostItem.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }
    
    await lostItem.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Lost item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's lost items
// @route   GET /api/lost-items/user
// @access  Private
exports.getUserLostItems = async (req, res) => {
  try {
    const lostItems = await LostItem.find({ user: req.user.id }).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: lostItems.length,
      data: lostItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 