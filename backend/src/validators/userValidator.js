const { body, param } = require('express-validator');

// Validation for creating a user
const createUserValidator = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email cannot exceed 255 characters'),

  body('skillset')
    .isArray({ min: 0 })
    .withMessage('Skillset must be an array')
    .custom((skillset) => {
      if (skillset.length > 50) {
        throw new Error('Cannot have more than 50 skills');
      }
      for (const skill of skillset) {
        if (typeof skill !== 'string') {
          throw new Error('Each skill must be a string');
        }
        if (skill.trim().length === 0) {
          throw new Error('Skills cannot be empty');
        }
        if (skill.length > 100) {
          throw new Error('Each skill cannot exceed 100 characters');
        }
      }
      // Check for duplicates
      const uniqueSkills = [...new Set(skillset.map(s => s.toLowerCase().trim()))];
      if (uniqueSkills.length !== skillset.length) {
        throw new Error('Duplicate skills are not allowed');
      }
      return true;
    }),

  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters')
    .trim(),

  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters')
    .trim(),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('Status must be one of: ACTIVE, INACTIVE, SUSPENDED')
];

// Validation for updating a user
const updateUserValidator = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email cannot exceed 255 characters'),

  body('skillset')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Skillset must be an array')
    .custom((skillset) => {
      if (skillset.length > 50) {
        throw new Error('Cannot have more than 50 skills');
      }
      for (const skill of skillset) {
        if (typeof skill !== 'string') {
          throw new Error('Each skill must be a string');
        }
        if (skill.trim().length === 0) {
          throw new Error('Skills cannot be empty');
        }
        if (skill.length > 100) {
          throw new Error('Each skill cannot exceed 100 characters');
        }
      }
      // Check for duplicates
      const uniqueSkills = [...new Set(skillset.map(s => s.toLowerCase().trim()))];
      if (uniqueSkills.length !== skillset.length) {
        throw new Error('Duplicate skills are not allowed');
      }
      return true;
    }),

  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters')
    .trim(),

  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters')
    .trim(),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
    .withMessage('Status must be one of: ACTIVE, INACTIVE, SUSPENDED')
];

// Validation for adding a single skill
const skillValidator = [
  body('skill')
    .notEmpty()
    .withMessage('Skill is required')
    .isString()
    .withMessage('Skill must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Skill must be between 1 and 100 characters')
    .trim()
];

// Validation for updating skillset
const skillsetValidator = [
  body('skillset')
    .isArray({ min: 0 })
    .withMessage('Skillset must be an array')
    .custom((skillset) => {
      if (skillset.length > 50) {
        throw new Error('Cannot have more than 50 skills');
      }
      for (const skill of skillset) {
        if (typeof skill !== 'string') {
          throw new Error('Each skill must be a string');
        }
        if (skill.trim().length === 0) {
          throw new Error('Skills cannot be empty');
        }
        if (skill.length > 100) {
          throw new Error('Each skill cannot exceed 100 characters');
        }
      }
      // Check for duplicates
      const uniqueSkills = [...new Set(skillset.map(s => s.toLowerCase().trim()))];
      if (uniqueSkills.length !== skillset.length) {
        throw new Error('Duplicate skills are not allowed');
      }
      return true;
    })
];

// Validation for user ID parameter
const userIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string')
    .isLength({ min: 1 })
    .withMessage('User ID cannot be empty')
];

// Validation for email parameter
const emailValidator = [
  param('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail()
];

// Validation for skill parameter
const skillParamValidator = [
  param('skill')
    .notEmpty()
    .withMessage('Skill is required')
    .isString()
    .withMessage('Skill must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Skill must be between 1 and 100 characters')
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  skillValidator,
  skillsetValidator,
  userIdValidator,
  emailValidator,
  skillParamValidator
};