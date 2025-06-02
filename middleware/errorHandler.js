import responseUtils from '../utils/response.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return responseUtils.notFound(res, 'Resource not found');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return responseUtils.badRequest(res, 'Duplicate field value entered');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    return responseUtils.badRequest(res, message.join(', '));
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return responseUtils.conflict(res, 'Duplicate field value entered');
  }

  if (err.code === 'P2025') {
    return responseUtils.notFound(res, 'Record not found');
  }

  if (err.code === 'P2014') {
    return responseUtils.badRequest(res, 'Invalid ID provided');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return responseUtils.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return responseUtils.unauthorized(res, 'Token expired');
  }

  // Default error response
  return responseUtils.internalError(res, error.message || 'Server Error');
};

export default errorHandler;