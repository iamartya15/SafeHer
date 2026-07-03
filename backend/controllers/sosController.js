const SOSAlert = require('../models/SOSAlert');
const Guardian = require('../models/Guardian');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendMail } = require('../config/mail');

/**
 * Trigger SOS Alert
 */
const triggerSOS = async (req, res, next) => {
  const { latitude, longitude, batteryLevel, browserInfo } = req.body;
  try {
    // 1. Create SOS Alert Record
    const sos = await SOSAlert.create({
      userId: req.user.id,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)] // [lng, lat]
      },
      batteryLevel: batteryLevel || 100,
      browserInfo: browserInfo || {}
    });

    // 2. Fetch approved guardians
    const guardiansList = await Guardian.find({
      userId: req.user.id,
      status: 'approved'
    }).populate('guardianId', 'name email');

    // 3. Create emergency Google Maps URL
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    // 4. Send email notification to each guardian
    const emailPromises = guardiansList.map(async (guard) => {
      const guardianUser = guard.guardianId;
      if (!guardianUser || !guardianUser.email) return;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #ef4444; border-radius: 10px;">
          <h2 style="color: #ef4444; text-align: center; margin-top: 0;">🚨 EMERGENCY SOS ALERT 🚨</h2>
          <p>Dear ${guardianUser.name},</p>
          <p style="font-size: 16px; font-weight: bold; color: #333;">
            Your contact, <strong>${req.user.name}</strong>, has triggered an emergency SOS alert from SafeHer AI!
          </p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>User:</strong> ${req.user.name}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${req.user.phone || 'Not provided'}</p>
            <p style="margin: 5px 0;"><strong>Battery Level:</strong> ${batteryLevel || 'Unknown'}%</p>
            <p style="margin: 5px 0;"><strong>Timestamp:</strong> ${new Date(sos.createdAt).toLocaleString()}</p>
          </div>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${mapsUrl}" style="background-color: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.4);">
              View Real-time Location on Maps
            </a>
          </p>

          <p>Please check on them or call local emergency services immediately.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #ef4444; text-align: center; font-style: italic;">SafeHer AI Emergency Dispatch System.</p>
        </div>
      `;

      // Dispatch Email
      await sendMail({
        to: guardianUser.email,
        subject: `🚨 EMERGENCY: SOS Alert from ${req.user.name}!`,
        text: `EMERGENCY ALERT: ${req.user.name} has triggered SOS. Location: ${mapsUrl}. Phone: ${req.user.phone || 'N/A'}. Battery: ${batteryLevel || 'Unknown'}%`,
        html: emailHtml
      });

      // Create Notification Record for Guardian in DB
      await Notification.create({
        recipientId: guardianUser._id,
        title: `🚨 EMERGENCY: SOS Alert from ${req.user.name}`,
        message: `${req.user.name} has triggered an SOS alert. Battery: ${batteryLevel}%. Check their location immediately.`,
        type: 'sos'
      });
    });

    await Promise.all(emailPromises);

    res.status(201).json({
      success: true,
      message: 'SOS Alert triggered successfully. Guardians have been notified.',
      sos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve SOS Alert
 */
const resolveSOS = async (req, res, next) => {
  try {
    const sos = await SOSAlert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, status: 'active' },
      { status: 'resolved' },
      { new: true }
    );

    if (!sos) {
      return res.status(404).json({ success: false, message: 'Active SOS alert not found or already resolved' });
    }

    // Notify guardians that the emergency has been resolved
    const guardiansList = await Guardian.find({
      userId: req.user.id,
      status: 'approved'
    }).populate('guardianId', 'name email');

    guardiansList.forEach(async (guard) => {
      const guardianUser = guard.guardianId;
      if (!guardianUser) return;

      await Notification.create({
        recipientId: guardianUser._id,
        title: `✅ SOS Resolved: ${req.user.name}`,
        message: `${req.user.name} has marked their emergency alert as resolved.`,
        type: 'system'
      });
    });

    res.status(200).json({
      success: true,
      message: 'SOS Alert resolved successfully',
      sos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Active SOS Alert for User
 */
const getActiveSOS = async (req, res, next) => {
  try {
    const sos = await SOSAlert.findOne({ userId: req.user.id, status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      hasActiveSos: !!sos,
      sos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get SOS History
 */
const getSOSHistory = async (req, res, next) => {
  try {
    const history = await SOSAlert.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerSOS,
  resolveSOS,
  getActiveSOS,
  getSOSHistory
};
