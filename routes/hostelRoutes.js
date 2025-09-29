const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const hostelController = require('../controllers/hostelController');

// @route   GET /api/hostels
// @desc    Get all hostels
// @access  Public
router.get('/', hostelController.getAllHostels);

// @route   GET /api/hostels/my-hostels
// @desc    Get current realtor's hostels
// @access  Private (Realtor only)
router.get('/my-hostels', auth, hostelController.getMyHostels);

// @route   GET /api/hostels/:id
// @desc    Get hostel by ID
// @access  Public
router.get('/:id', hostelController.getHostelById);

// @route   POST /api/hostels
// @desc    Create new hostel
// @access  Private (Realtor only)
router.post(
  '/',
  [
    auth,
    check('name', 'Hostel name is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty()
  ],
  hostelController.createHostel
);

// @route   PUT /api/hostels/:id
// @desc    Update hostel
// @access  Private (Realtor only)
router.put(
  '/:id',
  [
    auth,
    check('name', 'Hostel name is required').optional().not().isEmpty(),
    check('address', 'Address is required').optional().not().isEmpty()
  ],
  hostelController.updateHostel
);

// @route   DELETE /api/hostels/:id
// @desc    Delete hostel
// @access  Private (Realtor only)
router.delete('/:id', auth, hostelController.deleteHostel);

// @route   POST /api/hostels/:id/amenities
// @desc    Add amenity to hostel
// @access  Private (Realtor only)
router.post(
  '/:id/amenities',
  [
    auth,
    check('amenity_id', 'Amenity ID is required').isInt({ min: 1 })
  ],
  hostelController.addAmenityToHostel
);

// @route   DELETE /api/hostels/:id/amenities
// @desc    Remove amenity from hostel
// @access  Private (Realtor only)
router.delete(
  '/:id/amenities',
  [
    auth,
    check('amenity_id', 'Amenity ID is required').isInt({ min: 1 })
  ],
  hostelController.removeAmenityFromHostel
);

// @route   GET /api/hostels/:id/amenities
// @desc    Get hostel amenities
// @access  Public
router.get('/:id/amenities', hostelController.getHostelAmenities);

// @route   GET /api/hostels/:id/rooms
// @desc    Get hostel rooms
// @access  Public
router.get('/:id/rooms', hostelController.getHostelRooms);

module.exports = router;