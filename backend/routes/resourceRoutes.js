const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');
const resourceController = require('../controllers/resourceController');

// Base routes
router.route('/')
  .get(protect, cacheMiddleware(300), resourceController.getResources)
  .post(protect, authorize('faculty', 'admin'), resourceController.createResource);

router.route('/:id')
  .get(protect, resourceController.getResource)
  .put(protect, authorize('faculty', 'admin'), resourceController.updateResource)
  .delete(protect, authorize('faculty', 'admin'), resourceController.deleteResource);

// Faculty routes
router.get('/faculty', protect, authorize('faculty', 'admin'), resourceController.getProfessorResources);

// Get resources created by the logged-in professor
router.route('/professor')
  .get(protect, authorize('faculty'), resourceController.getProfessorResources);

module.exports = router; 