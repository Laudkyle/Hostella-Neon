const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const amenityController = require('../controllers/amenityController');

// @route   GET /api/amenities
// @desc    Get all amenities
// @access  Public
router.get('/', amenityController.getAllAmenities);

// @route   GET /api/amenities/:id
// @desc    Get amenity by ID
// @access  Public
router.get('/:id', amenityController.getAmenityById);

// @route   GET /api/amenities/:id/hostels
// @desc    Get hostels with specific amenity
// @access  Public
router.get('/:id/hostels', amenityController.getHostelsWithAmenity);

// @route   POST /api/amenities
// @desc    Create new amenity
// @access  Private (Add admin auth if needed)
router.post(
  '/',auth,
  [
    // auth, // Uncomment if you want to protect this route
    check('name', 'Amenity name is required').not().isEmpty()
  ],
  amenityController.createAmenity
);

// @route   PUT /api/amenities/:id
// @desc    Update amenity
// @access  Private (Add admin auth if needed)
router.put(
  '/:id',auth,
  [
    // auth, // Uncomment if you want to protect this route
    check('name', 'Amenity name is required').not().isEmpty()
  ],
  amenityController.updateAmenity
);

// @route   DELETE /api/amenities/:id
// @desc    Delete amenity
// @access  Private (Add admin auth if needed)
router.delete('/:id',auth, amenityController.deleteAmenity);

module.exports = router;