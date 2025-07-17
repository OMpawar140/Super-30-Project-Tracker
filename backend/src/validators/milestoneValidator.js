const { body, param } = require('express-validator');

// Validation for creating a milestone
const createMilestoneValidator = [
  body('name')
    .notEmpty()
    .withMessage('Milestone name is required')
    .isString()
    .withMessage('Milestone name must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Milestone name must be between 1 and 255 characters')
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
    .isIn(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'])
    .withMessage('Status must be one of: PLANNED, IN_PROGRESS, COMPLETED, OVERDUE'),

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

// Validation for updating a milestone
const updateMilestoneValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('Milestone name must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Milestone name must be between 1 and 255 characters')
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
    .isIn(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'])
    .withMessage('Status must be one of: PLANNED, IN_PROGRESS, COMPLETED, OVERDUE'),

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

// Validation for milestone ID parameter
const milestoneIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Milestone ID is required')
    .isString()
    .withMessage('Milestone ID must be a string')
    .isLength({ min: 1 })
    .withMessage('Milestone ID cannot be empty')
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
  createMilestoneValidator,
  updateMilestoneValidator,
  milestoneIdValidator,
  userIdValidator
};