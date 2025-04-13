const express = require('express');
const {
  getLostItems,
  getLostItem,
  createLostItem,
  updateLostItem,
  deleteLostItem,
  getUserLostItems
} = require('../controllers/lostItemController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Get user's lost items
router.get('/user', protect, getUserLostItems);

router.route('/')
  .get(getLostItems)
  .post(protect, createLostItem);

router.route('/:id')
  .get(getLostItem)
  .put(protect, updateLostItem)
  .delete(protect, deleteLostItem);

module.exports = router; 