const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Exclude from queries by default
    },
    role: {
      type: String,
      enum: ['user', 'guardian', 'admin'],
      default: 'user'
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/default-avatar.png' // Default placeholder URL
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String
    },
    verificationTokenExpires: {
      type: Date
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordTokenExpires: {
      type: Date
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
