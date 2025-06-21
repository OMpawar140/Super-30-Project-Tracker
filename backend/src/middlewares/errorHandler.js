const { errorResponse, notFoundResponse, serverErrorResponse } = require('../utils/response');

const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // AWS S3 specific errors
  if (error.code === 'NoSuchBucket') {
    return serverErrorResponse(res, 'S3 bucket not found', error);
  }

  if (error.code === 'NoSuchKey' || error.message === 'File not found') {
    return notFoundResponse(res, 'File not found');
  }

  if (error.code === 'AccessDenied') {
    return errorResponse(res, 'Access denied to S3 resource', 403);
  }

  // Multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 'File size too large', 400);
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return errorResponse(res, 'Unexpected file field', 400);
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return errorResponse(res, 'Validation error', 400, error.details);
  }

  // Default error
  return serverErrorResponse(res, 'Internal server error', error);
};

module.exports = errorHandler;