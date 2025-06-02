class ResponseUtils {
  // Success response
  success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Error response
  error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  // Created response
  created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  // Not found response
  notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  // Bad request response
  badRequest(res, message = 'Bad request', errors = null) {
    return this.error(res, message, 400, errors);
  }

  // Unauthorized response
  unauthorized(res, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  // Forbidden response
  forbidden(res, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  // Conflict response
  conflict(res, message = 'Conflict') {
    return this.error(res, message, 409);
  }

  // Validation error response
  validationError(res, errors) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
      timestamp: new Date().toISOString()
    });
  }

  // Paginated response
  paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      },
      timestamp: new Date().toISOString()
    });
  }

  // No content response
  noContent(res) {
    return res.status(204).send();
  }

  // Internal server error
  internalError(res, message = 'Internal server error') {
    return this.error(res, message, 500);
  }
}

export default new ResponseUtils();