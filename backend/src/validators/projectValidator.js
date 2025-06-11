const { body, param } = require('express-validator');

// Validation for creating a project
const createProjectValidator = [
  body('name')
    .notEmpty()
    .withMessage('Project name is required')
    .isString()
    .withMessage('Project name must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Project name must be between 1 and 255 characters')
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
    .isIn(['ACTIVE', 'COMPLETED', 'ARCHIVED', 'ON_HOLD'])
    .withMessage('Status must be one of: ACTIVE, COMPLETED, ARCHIVED, ON_HOLD'),

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

// Validation for updating a project
const updateProjectValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('Project name must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Project name must be between 1 and 255 characters')
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
    .isIn(['ACTIVE', 'COMPLETED', 'ARCHIVED', 'ON_HOLD'])
    .withMessage('Status must be one of: ACTIVE, COMPLETED, ARCHIVED, ON_HOLD'),

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

// Validation for adding a project member
const addMemberValidator = [
  body('*.userId')
    .notEmpty()
    .withMessage('User ID (email) is required')
    .isEmail()
    .withMessage('User ID must be a valid email address')
    .normalizeEmail(),

  body('*.role')
    .optional()
    .isIn(['ADMIN', 'TASK_COMPLETER'])
    .withMessage('Role must be either ADMIN or TASK_COMPLETER')
];

// Validation for project ID parameter
const projectIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Project ID is required')
    .isString()
    .withMessage('Project ID must be a string')
    .isLength({ min: 1 })
    .withMessage('Project ID cannot be empty')
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
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
  projectIdValidator,
  userIdValidator
};