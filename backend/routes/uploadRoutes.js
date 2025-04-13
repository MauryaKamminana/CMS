const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

router.post('/', protect, uploadController.uploadFile);

module.exports = router; 