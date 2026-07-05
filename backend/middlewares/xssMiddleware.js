const sanitizeHtml = require('sanitize-html');

const clean = (data) => {
  if (typeof data === 'string') {
    return sanitizeHtml(data, {
      allowedTags: [], // Strip all HTML tags
      allowedAttributes: {}, // Strip all attributes
    });
  }
  if (Array.isArray(data)) {
    return data.map((item) => clean(item));
  }
  if (typeof data === 'object' && data !== null) {
    Object.keys(data).forEach((key) => {
      data[key] = clean(data[key]);
    });
  }
  return data;
};

const xssClean = () => {
  return (req, res, next) => {
    if (req.body) req.body = clean(req.body);
    if (req.query) req.query = clean(req.query);
    if (req.params) req.params = clean(req.params);
    next();
  };
};

module.exports = xssClean;
