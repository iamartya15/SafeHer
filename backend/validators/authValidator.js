const { body, validationResult } = require('express-validator');

/**
 * Handle express-validator results
 */
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};

const registerValidator = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .trim(),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .trim(),
  body('role')
    .optional()
    .isIn(['user', 'guardian']).withMessage('Invalid role. Must be user or guardian'),
  validateResults
];

const loginValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validateResults
];

const forgotPasswordValidator = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  validateResults
];

const resetPasswordValidator = [
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateResults
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
};
