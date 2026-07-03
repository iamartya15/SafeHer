const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    batteryLevel: {
      type: Number,
      default: 100
    },
    browserInfo: {
      userAgent: String,
      platform: String,
      screenResolution: String
    },
    status: {
      type: String,
      enum: ['active', 'resolved'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

sosAlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);
