const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { pool } = require('../config/db');

module.exports = async (req, res, next) => {
  // Get token from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized to access this route' ,
      error: "No token present"
    });
  }

  try {
    // Verify token
const decoded = jwt.verify(token, jwtConfig.JWT_SECRET);
    
    // Check if user still exists
    const [user] = await pool.query(
      'SELECT id, email, role, is_active FROM users WHERE id = ?', 
      [decoded.id]
    );
    
    if (!user[0] || !user[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists'
      });
    }

    // Add user to request object
    req.user = {
      id: user[0].id,
      email: user[0].email,
      role: user[0].role
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error:err,
    });
  }
};