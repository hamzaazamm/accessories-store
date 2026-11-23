const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Authenticated users only
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gadget_district_fallback_secret');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.',
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'This account has been deactivated. Please contact support.',
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authorization token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }
};

/**
 * Role-based authorization - Admins only
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access restricted to administrators only.',
  });
};

/**
 * Optional authentication - extracts user if token provided, but allows guests through
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gadget_district_fallback_secret');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignore token errors for optional auth
      req.user = null;
    }
  }

  next();
};

/**
 * Generate JWT Token helper
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'gadget_district_fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = { protect, admin, optionalAuth, generateToken };
