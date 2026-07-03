const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Ensure upload temp directory exists
const getTempDir = () => {
  const localTempDir = path.join(__dirname, '..', 'public', 'temp');
  try {
    if (!fs.existsSync(localTempDir)) {
      fs.mkdirSync(localTempDir, { recursive: true });
    }
    return localTempDir;
  } catch (err) {
    // Fallback to OS temp dir if local temp dir creation fails
    return os.tmpdir();
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getTempDir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, JPG, PNG, WEBP, GIF) are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;
