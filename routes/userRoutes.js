const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, userController.getProfile);

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put(
  '/me',
  [
    auth,
    check('firstName', 'First name is required').optional().not().isEmpty(),
    check('lastName', 'Last name is required').optional().not().isEmpty(),
    check('phoneNumber', 'Please include a valid phone number').optional().isMobilePhone()
  ],
  userController.updateProfile
);

// @route   DELETE /api/users/me
// @desc    Delete user profile
// @access  Private
router.delete('/me', auth, userController.deleteProfile);

module.exports = router;