/**
 * Standardized API Response Formatter
 * Prevents inconsistent response objects across the API
 */

const sendResponse = (res, statusCode, success, message, data = {}, meta = {}) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    meta,
    error: success ? null : message
  });
};

const sendSuccess = (res, message, data = {}, meta = {}, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data, meta);
};

const sendError = (res, message, statusCode = 500, errorDetails = null) => {
  // We can choose to log errorDetails securely here if needed
  return sendResponse(res, statusCode, false, message, {}, { errorDetails });
};

module.exports = {
  sendSuccess,
  sendError
};
