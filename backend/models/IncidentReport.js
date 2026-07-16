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

// Geospatial Index
incidentReportSchema.index({ location: '2dsphere' });

// Text Index for full-text search
incidentReportSchema.index({ description: 'text', address: 'text', category: 'text' }, {
  weights: { category: 3, address: 2, description: 1 },
  name: "incident_text_index"
});

// Compound Indexes for fast filtering and sorting
incidentReportSchema.index({ category: 1, isVerified: 1, createdAt: -1 });
incidentReportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('IncidentReport', incidentReportSchema);
