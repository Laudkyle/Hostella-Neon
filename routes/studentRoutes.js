const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const studentController = require('../controllers/studentController');

// @route   GET /api/students/me
// @desc    Get student profile
// @access  Private (Student only)
router.get('/me', auth, studentController.getStudentProfile);

// @route   PUT /api/students/enrollment
// @desc    Update enrollment date
// @access  Private (Student only)
router.put(
  '/enrollment',
  auth,
  studentController.updateEnrollmentDate
);

module.exports = router;