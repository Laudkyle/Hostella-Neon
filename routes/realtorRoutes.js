const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const realtorController = require('../controllers/realtorController');

// @route   GET /api/realtors/me
// @desc    Get realtor profile
// @access  Private (Realtor only)
router.get('/me', auth, realtorController.getRealtorProfile);

// @route   PUT /api/realtors/company
// @desc    Update company name
// @access  Private (Realtor only)
router.put(
  '/company',
  auth,
  realtorController.updateCompany
);

module.exports = router;