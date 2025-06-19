const { body, param, query, validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/response');

class FileValidator {
  static validateUpload() {
    return [
      (req, res, next) => {
        if (!req.file) {
          return validationErrorResponse(res, [{ 
            param: 'file', 
            msg: 'No file provided',
            value: null
          }]);
        }
        next();
      }
    ];
  }

  static validateFileKey() {
    return [
      param('key')
        .notEmpty()
        .withMessage('File key is required')
        .isLength({ min: 1, max: 255 })
        .withMessage('File key must be between 1 and 255 characters')
    ];
  }

  static validateUrlExpiration() {
    return [
      query('expires')
        .optional()
        .isInt({ min: 60, max: 604800 }) // 1 minute to 7 days
        .withMessage('Expiration must be between 60 seconds and 7 days')
    ];
  }

  static handleValidationErrors() {
    return (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return validationErrorResponse(res, errors.array());
      }
      next();
    };
  }
}

module.exports = FileValidator;