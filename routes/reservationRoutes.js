const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const reservationController = require('../controllers/reservationController');

// @route   POST /api/reservations/calculate
// @desc    Calculate reservation price
// @access  Private
router.post(
  '/calculate',
  [
    auth,
    check('hostel_room_id', 'Hostel room ID is required').isInt({ min: 1 }),
    check('payment_strategy', 'Payment strategy must be full or half').isIn(['full', 'half']),
    check('start_date', 'Valid start date is required').isDate(),
    check('end_date', 'Valid end date is required').isDate()
  ],
  reservationController.calculatePrice
);

// @route   POST /api/reservations/initialize
// @desc    Initialize reservation and payment
// @access  Private
router.post(
  '/initialize',
  [
    auth,
    check('hostel_room_id', 'Hostel room ID is required').isInt({ min: 1 }),
    check('payment_strategy', 'Payment strategy must be full or half').isIn(['full', 'half']),
    check('start_date', 'Valid start date is required').isDate(),
    check('end_date', 'Valid end date is required').isDate(),
    check('shared_users', 'Shared users must be an array of user IDs').optional().isArray()
  ],
  reservationController.initializeReservation
);

// @route   POST /api/reservations/verify
// @desc    Verify payment and confirm reservation
// @access  Private
router.post(
  '/verify',
  [
    auth,
    check('reference', 'Payment reference is required').not().isEmpty()
  ],
  reservationController.verifyPayment
);

// @route   GET /api/reservations/my-reservations
// @desc    Get user's reservations
// @access  Private
router.get('/my-reservations', auth, reservationController.getMyReservations);

// @route   GET /api/reservations/:id
// @desc    Get reservation by ID
// @access  Private
router.get('/:id', auth, reservationController.getReservationById);

// @route   DELETE /api/reservations/:id
// @desc    Cancel reservation
// @access  Private
router.delete('/:id', auth, reservationController.cancelReservation);

module.exports = router;