import { ENV } from '../utils/constants.js';

// Rate limiting configuration
const rateLimitConfig = {
  // General rate limiter for all routes
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: ENV.NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    }
  },

  // Authentication routes rate limiter
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: ENV.NODE_ENV === 'production' ? 5 : 50, // Very strict in production
    message: {
      error: 'Too many authentication attempts from this IP, please try again later.',
      retryAfter: '15 minutes'
    }
  },

  // API routes rate limiter
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: ENV.NODE_ENV === 'production' ? 200 : 2000, // Higher limit for API calls
    message: {
      error: 'Too many API requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    }
  },

  // Strict rate limiter for sensitive operations (login, register, password change)
  strict: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: ENV.NODE_ENV === 'production' ? 3 : 30, // Very strict limits
    message: {
      error: 'Too many attempts for this sensitive operation, please try again later.',
      retryAfter: '1 hour'
    }
  },

  // File upload rate limiter
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: ENV.NODE_ENV === 'production' ? 10 : 100,
    message: {
      error: 'Too many file upload attempts, please try again later.',
      retryAfter: '1 hour'
    }
  },

  // Email sending rate limiter
  email: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: ENV.NODE_ENV === 'production' ? 5 : 50,
    message: {
      error: 'Too many email requests, please try again later.',
      retryAfter: '1 hour'
    }
  },

  // Password reset rate limiter
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: ENV.NODE_ENV === 'production' ? 3 : 30,
    message: {
      error: 'Too many password reset attempts, please try again later.',
      retryAfter: '1 hour'
    }
  }
};

// Skip rate limiting for specific IPs (useful for testing or trusted sources)
const skipSuccessfulRequests = false; // Set to true to only count failed requests
const skipFailedRequests = false; // Set to true to only count successful requests

// Trusted IPs that should bypass rate limiting (use with caution)
const trustedIPs = [
  // '127.0.0.1', // localhost
  // Add trusted IPs here
];

// Custom skip function
const skip = (req) => {
  // Skip rate limiting for trusted IPs
  if (trustedIPs.includes(req.ip)) {
    return true;
  }
  
  // Skip rate limiting in test environment
  if (ENV.NODE_ENV === 'test') {
    return true;
  }
  
  return false;
};

export {
  rateLimitConfig,
  skipSuccessfulRequests,
  skipFailedRequests,
  trustedIPs,
  skip
};

export default rateLimitConfig;