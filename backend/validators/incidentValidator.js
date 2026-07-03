const { body, validationResult } = require('express-validator');

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

const createIncidentValidator = [
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Harassment', 'Theft', 'Stalking', 'Poor Lighting', 'Unsafe Area', 'Road Issue'])
    .withMessage('Invalid category'),
  body('description')
    .notEmpty().withMessage('Description is required')
    .trim(),
  body('latitude')
    .notEmpty().withMessage('Latitude is required')
    .isNumeric().withMessage('Latitude must be a number'),
  body('longitude')
    .notEmpty().withMessage('Longitude is required')
    .isNumeric().withMessage('Longitude must be a number'),
  body('address')
    .optional()
    .trim(),
  validateResults
];

module.exports = {
  createIncidentValidator
};
