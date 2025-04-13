const CanteenProduct = require('../models/CanteenProduct');
const { clearCache } = require('../middleware/cache');

// @desc    Get all canteen products
// @route   GET /api/canteen/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, search, available } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by availability
    if (available === 'true') {
      query.isAvailable = true;
      query.quantity = { $gt: 0 };
    }
    
    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const products = await CanteenProduct.find(query).sort({ category: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error getting canteen products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single canteen product
// @route   GET /api/canteen/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await CanteenProduct.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error getting canteen product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new canteen product
// @route   POST /api/canteen/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;
    
    const product = await CanteenProduct.create(req.body);
    
    // Clear cache
    clearCache('canteen-products');
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating canteen product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update canteen product
// @route   PUT /api/canteen/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await CanteenProduct.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    product = await CanteenProduct.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // Clear cache
    clearCache('canteen-products');
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error updating canteen product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete canteen product
// @route   DELETE /api/canteen/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await CanteenProduct.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await product.remove();
    
    // Clear cache
    clearCache('canteen-products');
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting canteen product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 