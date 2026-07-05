const IncidentReport = require('../models/IncidentReport');
const { uploadImage } = require('../config/cloudinary');
const mongoose = require('mongoose');

/**
 * Create a new Incident Report
 */
const createIncident = async (req, res, next) => {
  const { category, description, latitude, longitude, address } = req.body;
  try {
    let imageUrl = '';
    
    // Upload image if present
    if (req.file) {
      const uploadResult = await uploadImage(req.file.path, 'safeher_incidents');
      imageUrl = uploadResult.url;
    }

    const report = await IncidentReport.create({
      userId: req.user.id,
      category,
      description,
      image: imageUrl,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)] // GeoJSON is [lng, lat]
      },
      address: address || 'Unknown location'
    });

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully',
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all Incident Reports
 * Supports geographic filtering if lat/lng/distance are query parameters
 */
const getIncidents = async (req, res, next) => {
  const { lat, lng, distance = 5000 } = req.query; // distance in meters, default 5km
  try {
    let query = { isVerified: true };

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(distance)
        }
      };
    }

    const reports = await IncidentReport.find(query)
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Incident by ID
 */
const getIncidentById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Incident ID format' });
    }
    const report = await IncidentReport.findById(req.params.id).populate('userId', 'name avatar email phone');
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Incident report not found' });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Incident Report
 */
const updateIncident = async (req, res, next) => {
  const { category, description, latitude, longitude, address } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Incident ID format' });
    }
    let report = await IncidentReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Incident report not found' });
    }

    // Restrict updates to the owner or admins
    if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this report' });
    }

    if (category) report.category = category;
    if (description) report.description = description;
    if (address) report.address = address;
    if (latitude && longitude) {
      report.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    if (req.file) {
      const uploadResult = await uploadImage(req.file.path, 'safeher_incidents');
      report.image = uploadResult.url;
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Incident report updated successfully',
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Incident Report
 */
const deleteIncident = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Incident ID format' });
    }
    const report = await IncidentReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Incident report not found' });
    }

    // Restrict deletion to owner or admins
    if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this report' });
    }

    await IncidentReport.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Incident report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident
};
