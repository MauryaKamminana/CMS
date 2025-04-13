const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const canteenController = require('../controllers/canteenController');

// Product routes
router.get('/products', protect, canteenController.getProducts);
router.post('/products', protect, authorize('admin'), canteenController.createProduct);
router.get('/products/:id', protect, canteenController.getProductById);
router.put('/products/:id', protect, authorize('admin'), canteenController.updateProduct);
router.delete('/products/:id', protect, authorize('admin'), canteenController.deleteProduct);

// Order routes
router.get('/orders', protect, canteenController.getOrders);
router.post('/orders', protect, canteenController.createOrder);

// Add this route BEFORE the :id route to handle "my-orders" specifically
router.get('/orders/my-orders', protect, canteenController.getUserOrders);

// This route should come after more specific routes
router.get('/orders/:id', protect, canteenController.getOrderById);

router.put('/orders/:id/status', protect, authorize('admin'), canteenController.updateOrderStatus);
router.put('/orders/:id/payment', protect, authorize('admin'), canteenController.updatePaymentStatus);

// Dashboard data for admin
router.get('/dashboard', protect, authorize('admin'), canteenController.getDashboardData);

// User orders - keep this as an alternative route
router.get('/user/orders', protect, canteenController.getUserOrders);

module.exports = router; 