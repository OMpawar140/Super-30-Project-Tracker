const { body, param, query } = require('express-validator');

// Validation for file upload
const uploadFileValidator = [
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: [{ 
          param: 'file', 
          msg: 'No file provided',
          value: null
        }]
      });
    }
    next();
  }
];

// Validation for file key parameter
const fileKeyValidator = [
  param('key')
    .notEmpty()
    .withMessage('File key is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('File key must be between 1 and 255 characters')
    .trim()
];

// Validation for URL expiration query parameter
const urlExpirationValidator = [
  query('expires')
    .optional()
    .isInt({ min: 60, max: 604800 }) // 1 minute to 7 days
    .withMessage('Expiration must be between 60 seconds and 7 days')
    .toInt()
];

// Validation for file metadata
const fileMetadataValidator = [
  body('filename')
    .optional()
    .isString()
    .withMessage('Filename must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Filename must be between 1 and 255 characters')
    .trim(),

  body('contentType')
    .optional()
    .isString()
    .withMessage('Content type must be a string')
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/)
    .withMessage('Content type must be a valid MIME type'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('Cannot have more than 10 tags');
      }
      if (tags && tags.some(tag => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with maximum 50 characters');
      }
      return true;
    })
];

// Validation for file search/filter parameters
const fileSearchValidator = [
  query('filename')
    .optional()
    .isString()
    .withMessage('Filename must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Filename must be between 1 and 255 characters')
    .trim(),

  query('contentType')
    .optional()
    .isString()
    .withMessage('Content type must be a string'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['filename', 'size', 'lastModified', 'contentType'])
    .withMessage('Sort by must be one of: filename, size, lastModified, contentType'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc')
];

// Validation for bulk file operations
const bulkFileValidator = [
  body('keys')
    .isArray({ min: 1, max: 50 })
    .withMessage('Keys must be an array with 1 to 50 items'),

  body('keys.*')
    .notEmpty()
    .withMessage('Each file key is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Each file key must be between 1 and 255 characters')
    .trim()
];

// Validation for file sharing
const fileShareValidator = [
  body('permissions')
    .optional()
    .isIn(['read', 'write', 'delete'])
    .withMessage('Permissions must be one of: read, write, delete'),

  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date')
    .toDate()
    .custom((expiresAt) => {
      if (expiresAt && expiresAt <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    }),

  body('emails')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Emails must be an array with maximum 10 items'),

  body('emails.*')
    .isEmail()
    .withMessage('Each email must be a valid email address')
    .normalizeEmail()
];

module.exports = {
  uploadFileValidator,
  fileKeyValidator,
  urlExpirationValidator,
  fileMetadataValidator,
  fileSearchValidator,
  bulkFileValidator,
  fileShareValidator
};