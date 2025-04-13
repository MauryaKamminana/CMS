const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus
} = require('../controllers/canteenOrderController');

router.route('/')
  .post(protect, createOrder)
  .get(protect, authorize('admin'), getOrders);

router.get('/my-orders', protect, getUserOrders);

router.route('/:id')
  .get(protect, getOrder);

router.route('/:id/status')
  .put(protect, authorize('admin'), updateOrderStatus);

router.route('/:id/payment')
  .put(protect, authorize('admin'), updatePaymentStatus);

module.exports = router; 