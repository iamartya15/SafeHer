const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  uploadAvatar
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../validators/authValidator');

router.post('/register', registerValidator, register);
router.get('/verify-email', verifyEmail);
router.post('/login', loginValidator, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
