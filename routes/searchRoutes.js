const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const searchController = require('../controllers/searchController');

// @route   GET /api/search/hostels
// @desc    Search hostels with filters
// @access  Public
router.get(
  '/hostels',
  [
    check('roomType', 'Invalid room type').optional().isIn(['single', 'double', 'three', 'four']),
    check('maxPrice', 'Max price must be a positive number').optional().isFloat({ min: 0 }),
    check('amenities', 'Amenities must be an array of integers').optional().isArray()
  ],
  searchController.searchHostels
);

// @route   GET /api/search/hostels/:id/details
// @desc    Get hostel with full details
// @access  Public
router.get('/hostels/:id/details', searchController.getHostelWithDetails);

module.exports = router;