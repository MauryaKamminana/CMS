const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/canteenProductController');

router.route('/')
  .get(cacheMiddleware(300), getProducts)
  .post(protect, authorize('admin'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router; 