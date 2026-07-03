const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    guardianEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    guardianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    relationship: {
      type: String,
      required: true,
      default: 'Contact'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness of user-guardian pair
guardianSchema.index({ userId: 1, guardianEmail: 1 }, { unique: true });

module.exports = mongoose.model('Guardian', guardianSchema);
