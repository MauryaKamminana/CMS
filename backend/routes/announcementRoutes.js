const express = require('express');
const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { cacheMiddleware } = require('../middleware/cache');

router.route('/')
  .get(cacheMiddleware(300), getAnnouncements)
  .post(protect, admin, createAnnouncement);

router.route('/:id')
  .get(cacheMiddleware(300), getAnnouncement)
  .put(protect, admin, updateAnnouncement)
  .delete(protect, admin, deleteAnnouncement);

module.exports = router; 