const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../config/mail');
const { uploadImage } = require('../config/cloudinary');

// Helper to generate access and refresh tokens
const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });
  return { accessToken, refreshToken };
};

/**
 * Register User
 */
const register = async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;
  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const isDev = process.env.NODE_ENV !== 'production';
     
    console.log({
      name,
      email,
      password,
      phone,
      role: role || 'user',
      isVerified: isDev ? true : false,
      verificationToken,
      verificationTokenExpires
    })
    
    const user = new User({
      name,
      email,
      password,
      phone,
      role: role || 'user',
      isVerified: isDev ? true : false,
      verificationToken,
      verificationTokenExpires
    });

    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #c026d3; text-align: center;">Welcome to SafeHer AI</h2>
        <p>Dear ${name},</p>
        <p>Thank you for joining our community to make women safety smarter and more connected. Please verify your email by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #c026d3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p>Or copy this link to your browser:</p>
        <p style="word-break: break-all; color: #555;">${verificationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">This link will expire in 24 hours. If you did not register, please ignore this email.</p>
      </div>
    `;

    // Try sending email, fail silently/gracefully if it's development mode
    try {
      await sendMail({
        to: user.email,
        subject: 'Verify your email - SafeHer AI',
        text: `Welcome to SafeHer. Please verify your email by opening: ${verificationUrl}`,
        html: emailHtml
      });
    } catch (mailErr) {
      console.error('Mail delivery failed during registration:', mailErr.message);
      if (!isDev) throw mailErr;
    }

    const message = isDev
      ? 'Registration successful! Development mode: Account auto-verified. You can log in immediately.'
      : 'Registration successful! Please check your email to verify your account.';

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Email Token
 */
const verifyEmail = async (req, res, next) => {
  const { token } = req.query;
  try {
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login User
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Dynamic verification check for development environment
    const isDev = process.env.NODE_ENV !== 'production';
    if (!user.isVerified && isDev) {
      // In local dev, auto-verify if they haven't to avoid blocking
      user.isVerified = true;
      await user.save();
    } else if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in. Check your inbox.'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token in user document
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken, // Returned in body as backup for cross-origin issues
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Access Token
 */
const refreshToken = async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Refresh token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken // Returned in body as backup
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

/**
 * Logout User
 */
const logout = async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  try {
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot Password
 */
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #c026d3; text-align: center;">Reset SafeHer Password</h2>
        <p>Dear ${user.name},</p>
        <p>You requested a password reset. Please click the button below to specify a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #c026d3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy this link to your browser:</p>
        <p style="word-break: break-all; color: #555;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">This link will expire in 10 minutes. If you did not request a reset, please ignore this email.</p>
      </div>
    `;

    await sendMail({
      to: user.email,
      subject: 'Reset Password - SafeHer AI',
      text: `Reset your password by visiting: ${resetUrl}`,
      html: emailHtml
    });

    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset Password
 */
const resetPassword = async (req, res, next) => {
  const { token } = req.query;
  const { password } = req.body;
  try {
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    user.refreshToken = undefined; // Invalidate refresh tokens on password change
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully. You can now login.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Profile
 */
const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

/**
 * Update Profile
 */
const updateProfile = async (req, res, next) => {
  const { name, phone } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Avatar
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const uploadResult = await uploadImage(req.file.path, 'safeher_avatars');
    
    const user = await User.findById(req.user.id);
    user.avatar = uploadResult.url;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
