const { body, param } = require('express-validator');

// Validation for creating a task
const createTaskValidator = [
  body('title')
    .notEmpty()
    .withMessage('Task title is required')
    .isString()
    .withMessage('Task title must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Task title must be between 1 and 255 characters')
    .trim(),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),

  body('status')
    .optional()
    .isIn(['UPCOMING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'OVERDUE'])
    .withMessage('Status must be one of: UPCOMING, IN_PROGRESS, IN_REVIEW, COMPLETED, OVERDUE'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate()
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate) {
        const startDate = new Date(req.body.startDate);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    })
];

// Validation for updating a task
const updateTaskValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('Task name must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Task name must be between 1 and 255 characters')
    .trim(),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),

  body('status')
    .optional()
    .isIn(['UPCOMING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'OVERDUE'])
    .withMessage('Status must be one of: UPCOMING, IN_PROGRESS, IN_REVIEW, COMPLETED, OVERDUE'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .toDate(),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .toDate()
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate) {
        const startDate = new Date(req.body.startDate);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    })
];

// Validation for task ID parameter
const taskIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Task ID is required')
    .isString()
    .withMessage('Task ID must be a string')
    .isLength({ min: 1 })
    .withMessage('Task ID cannot be empty')
];

// Validation for user ID parameter (email)
const userIdValidator = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isEmail()
    .withMessage('User ID must be a valid email address')
    .normalizeEmail()
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
  userIdValidator
};