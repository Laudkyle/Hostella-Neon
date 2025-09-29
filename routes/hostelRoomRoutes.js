const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const hostelRoomController = require('../controllers/hostelRoomController');

// @route   GET /api/hostels/:id/rooms/:roomId
// @desc    Get room by ID
// @access  Public
router.get('/:id/rooms/:roomId', hostelRoomController.getRoomById);

// @route   POST /api/hostels/:id/rooms
// @desc    Create room for hostel
// @access  Private (Realtor only)
router.post(
  '/:id/rooms',
  [
    auth,
    check('room_type', 'Room type is required').isIn(['single', 'double', 'three', 'four']),
    check('price_per_year', 'Price per year must be a positive number').isFloat({ min: 0 }),
    check('quantity_available', 'Quantity available must be a non-negative integer').isInt({ min: 0 })
  ],
  hostelRoomController.createRoom
);

// @route   PUT /api/hostels/:id/rooms/:roomId
// @desc    Update room
// @access  Private (Realtor only)
router.put(
  '/:id/rooms/:roomId',
  [
    auth,
    check('price_per_year', 'Price per year must be a positive number').optional().isFloat({ min: 0 }),
    check('quantity_available', 'Quantity available must be a non-negative integer').optional().isInt({ min: 0 })
  ],
  hostelRoomController.updateRoom
);

// @route   PUT /api/hostels/:id/rooms/:roomId/quantity
// @desc    Update room quantity
// @access  Private (Realtor only)
router.put(
  '/:id/rooms/:roomId/quantity',
  [
    auth,
    check('quantity_available', 'Quantity available must be a non-negative integer').isInt({ min: 0 })
  ],
  hostelRoomController.updateRoomQuantity
);

// @route   DELETE /api/hostels/:id/rooms/:roomId
// @desc    Delete room
// @access  Private (Realtor only)
router.delete('/:id/rooms/:roomId', auth, hostelRoomController.deleteRoom);

module.exports = router;