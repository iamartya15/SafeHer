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
      required: [function () { return !this.googleId; }, 'Password is required'],
      validate: {
        validator: function(v) {
          if (!this.isModified('password')) return true;
          if (!v) return true;
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
        },
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      },
      select: false // Exclude from queries by default
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    role: {
      type: String,
      enum: ['user', 'guardian', 'admin'],
      default: 'user'
    },
    roles: {
      type: [String],
      default: ['user']
    },
    isBlocked: {
      type: Boolean,
      default: false
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
  if (!this.password || !this.isModified('password')) return next();
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
