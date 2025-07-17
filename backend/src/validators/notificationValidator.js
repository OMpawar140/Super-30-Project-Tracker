const { body, query, param, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

// Validation for notification query parameters
const validateNotificationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('unreadOnly')
    .optional()
    .isBoolean()
    .withMessage('unreadOnly must be a boolean'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];

// Validation for notification ID parameter
const validateNotificationId = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Notification ID is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Invalid notification ID', 400, errors.array());
    }
    next();
  }
];

// Validation for creating notifications (for internal use)
const validateNotificationCreation = [
  body('type')
    .isIn([
      'PROJECT_MEMBER_ADDED',
      'TASK_APPROVED',
      'TASK_REJECTED',
      'TASK_REVIEW_REQUESTED',
      'TASK_STARTED',
      'TASK_OVERDUE',
      'TASK_DUE_REMINDER'
    ])
    .withMessage('Invalid notification type'),
  
  body('title')
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('message')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  
  body('userId')
    .isEmail()
    .withMessage('Valid user email is required'),
  
  body('projectId')
    .optional()
    .isString()
    .withMessage('Project ID must be a string'),
  
  body('taskId')
    .optional()
    .isString()
    .withMessage('Task ID must be a string'),
  
  body('taskReviewId')
    .optional()
    .isString()
    .withMessage('Task Review ID must be a string'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }
    next();
  }
];

module.exports = {
  validateNotificationQuery,
  validateNotificationId,
  validateNotificationCreation
};
