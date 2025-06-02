import { body } from 'express-validator';
import { VALIDATION_RULES, USER_ROLES } from '../utils/constants.js';

// Validation rules for user creation
const createUserValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: VALIDATION_RULES.NAME_MIN_LENGTH, max: VALIDATION_RULES.NAME_MAX_LENGTH })
    .withMessage(`Name must be between ${VALIDATION_RULES.NAME_MIN_LENGTH} and ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`),
  
  body('password')
    .isLength({ min: VALIDATION_RULES.PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`)
    .matches(VALIDATION_RULES.PASSWORD_REGEX)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn([USER_ROLES.USER, USER_ROLES.ADMIN])
    .withMessage(`Role must be either ${USER_ROLES.USER} or ${USER_ROLES.ADMIN}`)
];

// Validation rules for user update
const updateUserValidation = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: VALIDATION_RULES.NAME_MIN_LENGTH, max: VALIDATION_RULES.NAME_MAX_LENGTH })
    .withMessage(`Name must be between ${VALIDATION_RULES.NAME_MIN_LENGTH} and ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`),
  
  body('password')
    .optional()
    .isLength({ min: VALIDATION_RULES.PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`)
    .matches(VALIDATION_RULES.PASSWORD_REGEX)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn([USER_ROLES.USER, USER_ROLES.ADMIN])
    .withMessage(`Role must be either ${USER_ROLES.USER} or ${USER_ROLES.ADMIN}`)
];

// Validation rules for user login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation for user ID parameter
const userIdValidation = [
  body('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
];

export {
  createUserValidation,
  updateUserValidation,
  loginValidation,
  userIdValidation
};