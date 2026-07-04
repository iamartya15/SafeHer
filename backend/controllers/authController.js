const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail } = require('../config/mail');
const { uploadImage } = require('../config/cloudinary');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    const adminEmail = process.env.ADMIN_EMAIL || 'amartyakushwaha30@gmail.com';
    const assignedRole = (email.toLowerCase().trim() === adminEmail.toLowerCase().trim()) ? 'admin' : (role || 'user');

    const user = new User({
      name,
      email,
      password,
      phone,
      role: assignedRole,
      isVerified: true  // Auto-verify all users — email verification disabled for now
    });

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;

    // Single database write
    await user.save();

    // Set refresh token in cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to SafeHer AI.',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
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

    // Email verification disabled — allow all users to login directly
    if (!user.isVerified) {
      user.isVerified = true; // Auto-fix any unverified legacy users
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'amartyakushwaha30@gmail.com';
    if (user.email.toLowerCase().trim() === adminEmail.toLowerCase().trim() && user.role !== 'admin') {
      user.role = 'admin';
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token in user document (and isVerified if it was set in dev)
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
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
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
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

    // Send reset email in background (don't block response)
    sendMail({
      to: user.email,
      subject: 'Reset Password - SafeHer AI',
      text: `Reset your password by visiting: ${resetUrl}`,
      html: emailHtml
    }).catch((mailErr) => {
      console.error('Mail delivery failed during forgot password:', mailErr.message);
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

const googleLogin = async (req, res, next) => {
  const { idToken } = req.body;
  console.log('[GOOGLE AUTH BACKEND] Request received.');
  console.log('[GOOGLE AUTH BACKEND] GOOGLE_CLIENT_ID from env:', process.env.GOOGLE_CLIENT_ID);
  console.log('[GOOGLE AUTH BACKEND] Received ID Token (length):', idToken ? idToken.length : 0);
  
  if (!idToken) {
    console.error('[GOOGLE AUTH BACKEND] Failure: Google ID Token is missing');
    return res.status(400).json({ success: false, message: 'Google ID Token is required' });
  }

  try {
    console.log('[GOOGLE AUTH BACKEND] Initializing OAuth2Client with client ID');
    const authClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    console.log('[GOOGLE AUTH BACKEND] Verifying ID Token...');
    const ticket = await authClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    console.log('[GOOGLE AUTH BACKEND] Token verified successfully. Payload audience:', payload.aud);
    console.log('[GOOGLE AUTH BACKEND] Extracted user info:');
    console.log('  - Email:', payload.email);
    console.log('  - Name:', payload.name);
    console.log('  - googleId (sub):', payload.sub);
    console.log('  - Picture:', payload.picture);

    const { sub: googleId, email, name, picture } = payload;

    console.log('[GOOGLE AUTH BACKEND] Searching MongoDB for user...');
    let user = await User.findOne({
      $or: [{ googleId }, { email }]
    });

    if (user) {
      console.log('[GOOGLE AUTH BACKEND] Found existing user in MongoDB:', user._id);
      console.log('  - Existing googleId:', user.googleId);
      console.log('  - Existing email:', user.email);
      console.log('  - Existing isVerified:', user.isVerified);

      if (user.googleId && user.googleId !== googleId) {
        console.error('[GOOGLE AUTH BACKEND] Failure: Account already linked with a different Google account');
        return res.status(409).json({
          success: false,
          message: 'This account is already linked with another Google account.'
        });
      }

      if (!user.googleId) {
        console.log('[GOOGLE AUTH BACKEND] User does not have a googleId linked yet. Checking verification...');
        if (!user.isVerified) {
          console.error('[GOOGLE AUTH BACKEND] Failure: Existing email is not verified');
          return res.status(400).json({
            success: false,
            message: 'An account with this email already exists but is not verified. Please log in with your password first.'
          });
        }
        console.log('[GOOGLE AUTH BACKEND] Email is verified. Linking googleId to existing user.');
        user.googleId = googleId;
      }

      const defaultAvatar = 'https://res.cloudinary.com/default-avatar.png';
      if (!user.avatar || user.avatar === defaultAvatar) {
        console.log('[GOOGLE AUTH BACKEND] Current avatar is empty or default. Setting Google picture.');
        user.avatar = picture || defaultAvatar;
      } else {
        console.log('[GOOGLE AUTH BACKEND] Keeping existing avatar:', user.avatar);
      }

      user.isVerified = true;

    } else {
      console.log('[GOOGLE AUTH BACKEND] No user found. Registering a new Google user...');
      const defaultAvatar = 'https://res.cloudinary.com/default-avatar.png';
      user = new User({
        name,
        email,
        googleId,
        avatar: picture || defaultAvatar,
        isVerified: true
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'amartyakushwaha30@gmail.com';
    if (user.email.toLowerCase().trim() === adminEmail.toLowerCase().trim() && user.role !== 'admin') {
      console.log('[GOOGLE AUTH BACKEND] Auto-linking Admin role for this Google account.');
      user.role = 'admin';
    }

    console.log('[GOOGLE AUTH BACKEND] Generating Access/Refresh tokens...');
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;

    console.log('[GOOGLE AUTH BACKEND] Saving user document...');
    try {
      await user.save();
      console.log('[GOOGLE AUTH BACKEND] User saved successfully in database.');
    } catch (dbError) {
      console.error('[GOOGLE AUTH BACKEND] Database Save Failure:', dbError);
      if (dbError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email or Google ID already exists.'
        });
      }
      throw dbError;
    }

    console.log('[GOOGLE AUTH BACKEND] Setting cookies and sending successful response.');
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
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
    console.error('[GOOGLE AUTH BACKEND] UNCAUGHT ERROR during verification or execution:', error);
    return res.status(400).json({
      success: false,
      message: `Google Authentication failed: ${error.message}`
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  loginWithGoogle: googleLogin, // or just googleLogin
  googleLogin,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  uploadAvatar
};
