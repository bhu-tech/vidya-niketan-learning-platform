const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Auth validations
const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'admin']).withMessage('Invalid role'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// User profile validations
const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .escape(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters')
    .escape(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits'),
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Designation must not exceed 100 characters')
    .escape(),
  handleValidationErrors
];

// Fee validations
const feeValidation = [
  body('studentId')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID'),
  body('grade')
    .notEmpty().withMessage('Grade is required')
    .isIn(['IX', 'X', 'XI', 'XII']).withMessage('Invalid grade'),
  body('fatherName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Father name too long')
    .escape(),
  body('feeToBeDeposited')
    .notEmpty().withMessage('Fee to be deposited is required')
    .isNumeric().withMessage('Fee must be a number')
    .isFloat({ min: 0 }).withMessage('Fee cannot be negative'),
  body('feeSubmitted')
    .optional()
    .isNumeric().withMessage('Fee submitted must be a number')
    .isFloat({ min: 0 }).withMessage('Fee cannot be negative'),
  handleValidationErrors
];

// Result validations
const resultValidation = [
  body('student')
    .notEmpty().withMessage('Student ID is required')
    .isMongoId().withMessage('Invalid student ID'),
  body('classId')
    .notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Invalid class ID'),
  body('subject')
    .notEmpty().withMessage('Subject is required')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Subject must be between 2 and 100 characters')
    .escape(),
  body('marksObtained')
    .notEmpty().withMessage('Marks obtained is required')
    .isNumeric().withMessage('Marks must be a number')
    .isFloat({ min: 0 }).withMessage('Marks cannot be negative'),
  body('maxMarks')
    .notEmpty().withMessage('Max marks is required')
    .isNumeric().withMessage('Max marks must be a number')
    .isFloat({ min: 1 }).withMessage('Max marks must be at least 1'),
  body('examType')
    .optional()
    .isIn(['Mid-Term', 'Final', 'Quiz', 'Assignment', 'Other']).withMessage('Invalid exam type'),
  handleValidationErrors
];

// Class validations
const classValidation = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters')
    .escape(),
  handleValidationErrors
];

// MongoDB ID validation for params
const mongoIdValidation = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage(`Invalid ${paramName}`),
  handleValidationErrors
];

module.exports = {
  signupValidation,
  loginValidation,
  profileUpdateValidation,
  feeValidation,
  resultValidation,
  classValidation,
  mongoIdValidation,
  handleValidationErrors
};
