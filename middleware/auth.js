import jwt from 'jsonwebtoken';
import userService from '../services/userService.js';
import responseUtils from '../utils/response.js';

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return responseUtils.unauthorized(res, 'Access token is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      return responseUtils.unauthorized(res, 'Invalid token');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return responseUtils.unauthorized(res, 'Invalid token');
    }
    
    if (error.name === 'TokenExpiredError') {
      return responseUtils.unauthorized(res, 'Token expired');
    }

    responseUtils.internalError(res, 'Authentication error');
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return responseUtils.unauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return responseUtils.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userService.getUserById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

export {
  authenticateToken,
  authorize,
  optionalAuth
};