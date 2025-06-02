// Constants and configuration using ES6 modules
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

export const JWT_CONFIG = {
  DEFAULT_EXPIRES_IN: '1h',
  REFRESH_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256'
};

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
};

export const DATABASE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_TIMEOUT: 30000
};

export const SECURITY_CONFIG = {
  BCRYPT_ROUNDS: 10,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME: 900000, // 15 minutes
  RATE_LIMIT_WINDOW: 900000, // 15 minutes
  RATE_LIMIT_MAX: 100
};

export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  ACCESS_DENIED: 'Access denied',
  TOKEN_EXPIRED: 'Token expired',
  INVALID_TOKEN: 'Invalid token',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error'
};

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
};

// Environment variables with defaults
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || JWT_CONFIG.DEFAULT_EXPIRES_IN,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || JWT_CONFIG.REFRESH_EXPIRES_IN,
  DATABASE_URL: process.env.DATABASE_URL,
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || SECURITY_CONFIG.BCRYPT_ROUNDS
};

// API endpoints configuration
export const API_ENDPOINTS = {
  AUTH: {
    BASE: '/api/auth',
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh-token',
    PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
    LOGOUT: '/api/auth/logout'
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: '/api/users/:id'
  },
  SYSTEM: {
    ROOT: '/',
    HEALTH: '/health'
  }
};

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'text/plain'],
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Logging configuration
export const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  FORMAT: process.env.LOG_FORMAT || 'combined'
};

// Export all as a single object for convenience
export default {
  HTTP_STATUS,
  USER_ROLES,
  JWT_CONFIG,
  VALIDATION_RULES,
  DATABASE_CONFIG,
  SECURITY_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ENV,
  API_ENDPOINTS,
  UPLOAD_CONFIG,
  PAGINATION,
  LOG_CONFIG
};