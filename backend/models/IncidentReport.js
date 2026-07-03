const mongoose = require('mongoose');

const incidentReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['Harassment', 'Theft', 'Stalking', 'Poor Lighting', 'Unsafe Area', 'Road Issue'],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String
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
    address: {
      type: String,
      default: 'Unknown location'
    },
    isVerified: {
      type: Boolean,
      default: true // Reports are active unless moderated by admin
    }
  },
  {
    timestamps: true
  }
);

// Index 2dsphere for geospatial queries
incidentReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('IncidentReport', incidentReportSchema);
