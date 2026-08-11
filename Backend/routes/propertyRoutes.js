const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyListings,
  promoteProperty,
} = require('../controllers/propertyController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getProperties);

// Private landlord routes (MUST come before /:id route)
router.get('/my-listings', protect, authorize('landlord', 'agent'), getMyListings);

router.get('/:id', getPropertyById);

// Payment route to promote property
router.put(
  '/:id/promote',
  protect,
  authorize('landlord', 'agent'),
  promoteProperty
);

// Protected routes for creating/updating properties
router.post(
  '/',
  protect,
  authorize('landlord', 'agent'),
  upload.array('images', 5), // Max 5 images per property
  createProperty
);

router.put(
  '/:id',
  protect,
  authorize('landlord', 'agent'),
  upload.array('images', 5),
  updateProperty
);

router.delete('/:id', protect, authorize('landlord', 'agent'), deleteProperty);

module.exports = router;
