const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - verify access token
 */
const protect = async (req, res, next) => {
  let token;

  // Check header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const parts = req.headers.authorization.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

/**
 * Restrict routes to specific roles
 * @param {...string} roles - Allowed roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const userRoles = req.user.roles && req.user.roles.length > 0 ? req.user.roles : [req.user.role];
    const hasAccess = roles.some(role => userRoles.includes(role));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: `Your account roles (${userRoles.join(', ')}) are not authorized to access this resource`
      });
    }

    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
