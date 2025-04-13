const CanteenOrder = require('../models/CanteenOrder');
const CanteenProduct = require('../models/CanteenProduct');
const User = require('../models/User');
const { clearCache } = require('../middleware/cache');

// @desc    Create new order
// @route   POST /api/canteen/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, notes, pickupTime } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one item to your order'
      });
    }
    
    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await CanteenProduct.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }
      
      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable`
        });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough ${product.name} in stock. Available: ${product.quantity}`
        });
      }
      
      // Add to order items
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
      
      // Calculate total
      totalAmount += product.price * item.quantity;
      
      // Update product quantity
      product.quantity -= item.quantity;
      if (product.quantity === 0) {
        product.isAvailable = false;
      }
      await product.save();
    }
    
    // Create order
    const order = await CanteenOrder.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      paymentMethod,
      notes,
      pickupTime: pickupTime ? new Date(pickupTime) : undefined
    });
    
    // Clear cache
    clearCache('canteen-orders');
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error creating canteen order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all orders
// @route   GET /api/canteen/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const { status, date, user } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.orderDate = {
        $gte: startDate,
        $lte: endDate
      };
    }
    
    // Filter by user
    if (user) {
      query.user = user;
    }
    
    const orders = await CanteenOrder.find(query)
      .populate('user', 'name email')
      .sort({ orderDate: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error getting canteen orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/canteen/orders/my-orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await CanteenOrder.find({ user: req.user.id })
      .sort({ orderDate: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error getting user canteen orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/canteen/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await CanteenOrder.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error getting canteen order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/canteen/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }
    
    const order = await CanteenOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.status = status;
    
    // If status is cancelled, restore product quantities
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        const product = await CanteenProduct.findById(item.product);
        if (product) {
          product.quantity += item.quantity;
          product.isAvailable = true;
          await product.save();
        }
      }
    }
    
    await order.save();
    
    // Clear cache
    clearCache('canteen-orders');
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating canteen order status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/canteen/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a payment status'
      });
    }
    
    const order = await CanteenOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.paymentStatus = paymentStatus;
    await order.save();
    
    // Clear cache
    clearCache('canteen-orders');
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating canteen payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 