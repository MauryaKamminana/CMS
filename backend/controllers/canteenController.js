const Product = require('../models/canteen/Product');
const Order = require('../models/canteen/Order');
const asyncHandler = require('express-async-handler');

// @desc    Get all products with optional filtering
// @route   GET /api/canteen/products
// @access  Private
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, search, available } = req.query;
  
  let query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  if (available === 'true') {
    query.isAvailable = true;
  } else if (available === 'false') {
    query.isAvailable = false;
  }
  
  const products = await Product.find(query).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Create a new product
// @route   POST /api/canteen/products
// @access  Private (Admin)
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  
  res.status(201).json({
    success: true,
    data: product
  });
});

// @desc    Get a single product by ID
// @route   GET /api/canteen/products/:id
// @access  Private
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Update a product
// @route   PUT /api/canteen/products/:id
// @access  Private (Admin)
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Delete a product
// @route   DELETE /api/canteen/products/:id
// @access  Private (Admin)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  await Product.deleteOne({ _id: req.params.id });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all orders with optional filtering
// @route   GET /api/canteen/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res) => {
  const { status, paymentStatus, startDate, endDate, search } = req.query;
  
  let query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }
  
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  if (search) {
    query.$or = [
      { 'user.name': { $regex: search, $options: 'i' } },
      { 'user.email': { $regex: search, $options: 'i' } }
    ];
  }
  
  // For admin, get all orders; for regular users, get only their orders
  if (req.user.role !== 'admin') {
    query.user = req.user._id;
  }
  
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'name email');
  
  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// @desc    Create a new order
// @route   POST /api/canteen/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, totalAmount, paymentMethod, pickupTime, notes } = req.body;
  
  // Validate required fields
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Please add at least one item to the order');
  }
  
  if (!totalAmount) {
    res.status(400);
    throw new Error('Total amount is required');
  }
  
  // Create order with all required fields
  const orderItems = await Promise.all(items.map(async (item) => {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product with ID ${item.product} not found`);
    }
    
    return {
      product: item.product,
      name: product.name,
      price: product.price,
      quantity: item.quantity
    };
  }));
  
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    paymentMethod: paymentMethod || 'cash',
    pickupTime,
    notes
  });
  
  res.status(201).json({
    success: true,
    data: order
  });
});

// @desc    Get a single order by ID
// @route   GET /api/canteen/orders/:id
// @access  Private
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Make sure user is order owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to access this order');
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update order status
// @route   PUT /api/canteen/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    res.status(400);
    throw new Error('Please provide a status');
  }
  
  // Convert status to lowercase for consistency
  const normalizedStatus = status.toLowerCase();
  
  // Check if status is valid
  const validStatuses = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(normalizedStatus)) {
    res.status(400);
    throw new Error('Invalid status value');
  }
  
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: normalizedStatus },
    { new: true, runValidators: true }
  );
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Update payment status
// @route   PUT /api/canteen/orders/:id/payment
// @access  Private (Admin)
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  
  if (!paymentStatus) {
    res.status(400);
    throw new Error('Please provide a payment status');
  }
  
  let order = await Order.findById(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  order = await Order.findByIdAndUpdate(
    req.params.id,
    { paymentStatus },
    { new: true, runValidators: true }
  ).populate('user', 'name email');
  
  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Get admin dashboard data
// @route   GET /api/canteen/dashboard
// @access  Private (Admin)
exports.getDashboardData = asyncHandler(async (req, res) => {
  // Get total sales
  const totalSales = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  
  // Get total orders
  const totalOrders = await Order.countDocuments();
  
  // Get pending orders
  const pendingOrders = await Order.countDocuments({ status: 'pending' });
  
  // Get completed orders
  const completedOrders = await Order.countDocuments({ status: 'completed' });
  
  // Get recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email');
  
  // Get popular products
  const popularProducts = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.product', count: { $sum: '$items.quantity' } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  
  // Populate product details
  const populatedProducts = await Product.populate(popularProducts, {
    path: '_id',
    select: 'name price category'
  });
  
  res.status(200).json({
    success: true,
    data: {
      totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
      totalOrders,
      pendingOrders,
      completedOrders,
      recentOrders,
      popularProducts: populatedProducts.map(item => ({
        product: item._id,
        count: item.count
      }))
    }
  });
});

// @desc    Get user's orders
// @route   GET /api/canteen/user/orders
// @access  Private
exports.getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
}); 