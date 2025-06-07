import rateLimit from 'express-rate-limit';
import rateLimitConfig, { skip } from '../config/rateLimitConfig.js';

// Create rate limiter with configuration
const createLimiter = (config) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: skip, // Use custom skip function
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: config.message.error,
        retryAfter: config.message.retryAfter,
        limit: config.max,
        windowMs: config.windowMs
      });
    }
  });
};

// General rate limiter for all routes
const generalLimiter = createLimiter(rateLimitConfig.general);

// Strict rate limiter for authentication routes
const authLimiter = createLimiter(rateLimitConfig.auth);

// API rate limiter for general API routes
const apiLimiter = createLimiter(rateLimitConfig.api);

// Very strict rate limiter for sensitive operations
const strictLimiter = createLimiter(rateLimitConfig.strict);

// File upload rate limiter
const uploadLimiter = createLimiter(rateLimitConfig.upload);

// Email sending rate limiter
const emailLimiter = createLimiter(rateLimitConfig.email);

// Password reset rate limiter
const passwordResetLimiter = createLimiter(rateLimitConfig.passwordReset);

// Create custom rate limiter with options
const createCustomLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    }
  };

  const config = { ...defaults, ...options };
  return createLimiter(config);
};

export {
  generalLimiter,
  authLimiter,
  apiLimiter,
  strictLimiter,
  uploadLimiter,
  emailLimiter,
  passwordResetLimiter,
  createCustomLimiter
};

export default {
  general: generalLimiter,
  auth: authLimiter,
  api: apiLimiter,
  strict: strictLimiter,
  upload: uploadLimiter,
  email: emailLimiter,
  passwordReset: passwordResetLimiter,
  custom: createCustomLimiter
};