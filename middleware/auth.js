const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const pool  = require('../config/db');

module.exports = async (req, res, next) => {
  let token;

  // Extract token
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // No token
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized to access this route',
      error: 'No token present'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, jwtConfig.JWT_SECRET);
    console.log('Decoded JWT:', decoded);

    // Query Postgres
    const result = await pool.query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );
    console.log('Query result:', result.rows);

    const user = result.rows[0]; // ✅ correct way for pg

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists or is inactive'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    console.error('JWT middleware error:', err);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: err.message
    });
  }
};
