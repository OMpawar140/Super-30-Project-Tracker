/**
 * Utility functions for standardized API responses
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Data to send (optional)
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} meta - Additional metadata (optional)
 */
const successResponse = (res, message, data = null, statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  // Only include data if it's not null/undefined
  if (data !== null && data !== undefined) {
    response.data = data;
  }

  // Include metadata if provided
  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} errors - Detailed error information (optional)
 * @param {Object} meta - Additional metadata (optional)
 */
const errorResponse = (res, message, statusCode = 500, errors = null, meta = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    status: statusCode
  };

  // Include detailed errors if provided
  if (errors) {
    response.errors = errors;
  }

  // Include metadata if provided
  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Array} data - Array of data items
 * @param {Object} pagination - Pagination information
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const paginatedResponse = (res, message, data, pagination, statusCode = 200) => {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.currentPage || 1,
      totalPages: pagination.totalPages || 1,
      totalItems: pagination.totalItems || data.length,
      itemsPerPage: pagination.itemsPerPage || data.length,
      hasNextPage: pagination.hasNextPage || false,
      hasPrevPage: pagination.hasPrevPage || false
    },
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(response);
};

/**
 * Send a validation error response
 * @param {Object} res - Express response object
 * @param {Array} validationErrors - Array of validation errors from express-validator
 * @param {string} message - Custom error message (optional)
 */
const validationErrorResponse = (res, validationErrors, message = 'Validation failed') => {
  const errors = validationErrors.map(error => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value
  }));

  return errorResponse(res, message, 400, errors);
};

/**
 * Send an authentication error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 */
const authErrorResponse = (res, message = 'Authentication required') => {
  return errorResponse(res, message, 401);
};

/**
 * Send an authorization error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 403);
};

/**
 * Send a not found error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 */
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

/**
 * Send a conflict error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 */
const conflictResponse = (res, message = 'Resource conflict') => {
  return errorResponse(res, message, 409);
};

/**
 * Send a rate limit error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 */
const rateLimitResponse = (res, message = 'Too many requests') => {
  return errorResponse(res, message, 429);
};

/**
 * Send a server error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (optional)
 * @param {*} error - Error object for logging (optional)
 */
const serverErrorResponse = (res, message = 'Internal server error', error = null) => {
  // Log the error for debugging (in production, use proper logging)
  if (error) {
    console.error('Server Error:', error);
  }

  return errorResponse(res, message, 500);
};

/**
 * Create a standardized API response object (without sending)
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {*} data - Response data (optional)
 * @param {*} errors - Error details (optional)
 * @param {Object} meta - Additional metadata (optional)
 */
const createResponse = (success, message, data = null, errors = null, meta = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (errors) {
    response.errors = errors;
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
};

/**
 * Handle async errors in route handlers
 * @param {Function} fn - Async function to wrap
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Common HTTP status codes
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Response message templates
 */
const MESSAGES = {
  // Success messages
  SUCCESS: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    RETRIEVED: 'Resource retrieved successfully',
    OPERATION_COMPLETED: 'Operation completed successfully'
  },
  
  // Error messages
  ERROR: {
    VALIDATION_FAILED: 'Validation failed',
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    CONFLICT: 'Resource already exists',
    SERVER_ERROR: 'Internal server error',
    RATE_LIMIT: 'Too many requests, please try again later'
  },

  // Auth messages
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTER_SUCCESS: 'Registration successful',
    TOKEN_INVALID: 'Invalid or expired token',
    CREDENTIALS_INVALID: 'Invalid credentials'
  },

  // Project messages
  PROJECT: {
    CREATED: 'Project created successfully',
    UPDATED: 'Project updated successfully',
    DELETED: 'Project deleted successfully',
    RETRIEVED: 'Project retrieved successfully',
    MEMBER_ADDED: 'Member added successfully',
    MEMBER_REMOVED: 'Member removed successfully',
    NOT_FOUND: 'Project not found or access denied'
  }
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  validationErrorResponse,
  authErrorResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  rateLimitResponse,
  serverErrorResponse,
  createResponse,
  asyncHandler,
  HTTP_STATUS,
  MESSAGES
};