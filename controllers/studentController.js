const Student = require('../models/Student')

exports.getStudentProfile = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const student = await Student.findByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    
    res.json(student);
  } catch (error) {
    next(error);
  }
};

exports.updateEnrollmentDate = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { enrollmentDate } = req.body;
    if (!enrollmentDate) {
      return res.status(400).json({ message: 'Enrollment date is required' });
    }
    
    const updatedStudent = await Student.updateEnrollmentDate(req.user.id, enrollmentDate);
    res.json(updatedStudent);
  } catch (error) {
    next(error);
  }
};