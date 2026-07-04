const Guardian = require('../models/Guardian');
const User = require('../models/User');
const SOSAlert = require('../models/SOSAlert');
const Notification = require('../models/Notification');
const { sendMail } = require('../config/mail');

/**
 * Helper: fire-and-forget email — never blocks response or throws
 */
const sendMailAsync = (options) => {
  sendMail(options).catch((err) => {
    console.error('[Mail] Failed to send to', options.to, '—', err.message);
  });
};

/**
 * Add a Guardian
 */
const addGuardian = async (req, res, next) => {
  const { email, relationship } = req.body;
  try {
    // Basic input validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }

    const guardianEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guardianEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (guardianEmail === req.user.email.toLowerCase().trim()) {
      return res.status(400).json({ success: false, message: 'You cannot add yourself as a guardian' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Check if relationship already exists
    const existing = await Guardian.findOne({ userId: req.user.id, guardianEmail });

    if (existing) {
      if (existing.status === 'approved') {
        return res.status(400).json({ success: false, message: 'This contact is already your guardian' });
      }

      if (existing.status === 'pending') {
        // Resend invitation for pending request — fire emails in background
        const guardianUser = await User.findOne({ email: guardianEmail });
        if (guardianUser) {
          await Notification.create({
            recipientId: guardianUser._id,
            title: 'Guardian Request Reminder',
            message: `${req.user.name} has reminded you to accept their safety guardian request.`,
            type: 'guardian_request'
          });
          sendMailAsync({
            to: guardianEmail,
            subject: `Guardian Request Reminder from ${req.user.name} - SafeHer AI`,
            text: `Hello ${guardianUser.name}, ${req.user.name} has requested you to be their safety guardian on SafeHer. Please log in to accept.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #c026d3; text-align: center;">Guardian Request Reminder</h2>
                <p>Hello ${guardianUser.name},</p>
                <p><strong>${req.user.name}</strong> has requested you to be their safety guardian on SafeHer AI.</p>
                <p>As a guardian, you will receive alerts and real-time location updates if they ever trigger an SOS emergency.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${frontendUrl}/guardian" style="background-color: #c026d3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Request on Dashboard</a>
                </div>
              </div>
            `
          });
        } else {
          sendMailAsync({
            to: guardianEmail,
            subject: `Invitation to be a Safety Guardian for ${req.user.name} on SafeHer AI`,
            text: `Hello, ${req.user.name} has invited you to be their safety guardian on SafeHer. Please sign up to accept.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #c026d3; text-align: center;">SafeHer AI Guardian Invitation</h2>
                <p>Hello,</p>
                <p><strong>${req.user.name}</strong> has invited you to be their safety guardian on SafeHer AI.</p>
                <p>SafeHer AI helps keep women safe by tracking their live location during emergencies and providing real-time AI security guidance.</p>
                <p>Since you don't have an account yet, please register using this email to accept their safety guardian request.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${frontendUrl}/register" style="background-color: #c026d3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Register &amp; Accept Request</a>
                </div>
              </div>
            `
          });
        }
        return res.status(200).json({ success: true, message: 'Guardian invite resent successfully.', request: existing });
      }

      // If status is 'rejected' — reset and re-invite
      existing.status = 'pending';
      existing.relationship = relationship || 'Contact';
      await existing.save();

      const guardianUser = await User.findOne({ email: guardianEmail });
      if (guardianUser) {
        existing.guardianId = guardianUser._id;
        await existing.save();

        await Notification.create({
          recipientId: guardianUser._id,
          title: 'New Guardian Request',
          message: `${req.user.name} has requested you to be their safety guardian.`,
          type: 'guardian_request'
        });

        sendMailAsync({
          to: guardianEmail,
          subject: `New Guardian Request from ${req.user.name} - SafeHer AI`,
          text: `Hello ${guardianUser.name}, ${req.user.name} has requested you to be their safety guardian on SafeHer. Please log in to accept.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #c026d3; text-align: center;">New Guardian Request</h2>
              <p>Hello ${guardianUser.name},</p>
              <p><strong>${req.user.name}</strong> has requested you to be their safety guardian on SafeHer AI.</p>
              <p>As a guardian, you will receive alerts and real-time location updates if they ever trigger an SOS emergency.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${frontendUrl}/guardian" style="background-color: #c026d3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Request on Dashboard</a>
              </div>
            </div>
          `
        });
      } else {
        sendMailAsync({
          to: guardianEmail,
          subject: `Invitation to be a Safety Guardian for ${req.user.name} on SafeHer AI`,
          text: `Hello, ${req.user.name} has invited you to be their safety guardian on SafeHer. Please sign up to accept.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #c026d3; text-align: center;">SafeHer AI Guardian Invitation</h2>
              <p>Hello,</p>
              <p><strong>${req.user.name}</strong> has invited you to be their safety guardian on SafeHer AI.</p>
              <p>SafeHer AI helps keep women safe by tracking their live location during emergencies and providing real-time AI security guidance.</p>
              <p>Since you don't have an account yet, please register using this email to accept their safety guardian request.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${frontendUrl}/register" style="background-color: #c026d3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Register &amp; Accept Request</a>
              </div>
            </div>
          `
        });
      }

      return res.status(200).json({ success: true, message: 'Guardian invite resent successfully.', request: existing });
    }

    // New invitation
    const guardianUser = await User.findOne({ email: guardianEmail });

    const newRequest = await Guardian.create({
      userId: req.user.id,
      guardianEmail,
      guardianId: guardianUser ? guardianUser._id : undefined,
      relationship: relationship || 'Contact',
      status: 'pending'
    });

    if (guardianUser) {
      await Notification.create({
        recipientId: guardianUser._id,
        title: 'New Guardian Request',
        message: `${req.user.name} has requested you to be their safety guardian.`,
        type: 'guardian_request'
      });

      sendMailAsync({
        to: guardianEmail,
        subject: `New Guardian Request from ${req.user.name} - SafeHer AI`,
        text: `Hello ${guardianUser.name}, ${req.user.name} has requested you to be their safety guardian on SafeHer. Please log in to accept.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #c026d3; text-align: center;">New Guardian Request</h2>
            <p>Hello ${guardianUser.name},</p>
            <p><strong>${req.user.name}</strong> has requested you to be their safety guardian on SafeHer AI.</p>
            <p>As a guardian, you will receive alerts and real-time location updates if they ever trigger an SOS emergency.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/guardian" style="background-color: #c026d3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Request on Dashboard</a>
            </div>
          </div>
        `
      });
    } else {
      sendMailAsync({
        to: guardianEmail,
        subject: `Invitation to be a Safety Guardian for ${req.user.name} on SafeHer AI`,
        text: `Hello, ${req.user.name} has invited you to be their safety guardian on SafeHer. Please sign up to accept.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #c026d3; text-align: center;">SafeHer AI Guardian Invitation</h2>
            <p>Hello,</p>
            <p><strong>${req.user.name}</strong> has invited you to be their safety guardian on SafeHer AI.</p>
            <p>SafeHer AI helps keep women safe by tracking their live location during emergencies and providing real-time AI security guidance.</p>
            <p>Since you don't have an account yet, please register using this email to accept their safety guardian request.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/register" style="background-color: #c026d3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Register &amp; Accept Request</a>
            </div>
          </div>
        `
      });
    }

    res.status(201).json({
      success: true,
      message: guardianUser
        ? 'Guardian request sent successfully.'
        : 'Guardian not yet registered. Invitation sent — they will be linked once they sign up.',
      request: newRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User's Guardians
 */
const getGuardians = async (req, res, next) => {
  try {
    const list = await Guardian.find({ userId: req.user.id })
      .populate('guardianId', 'name email phone avatar role');

    res.status(200).json({ success: true, count: list.length, guardians: list });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Requests Received (When current user is the guardian)
 */
const getGuardianRequests = async (req, res, next) => {
  try {
    // Backfill guardianId for any pending requests that matched by email but missing ObjectId
    await Guardian.updateMany(
      {
        guardianEmail: req.user.email,
        $or: [{ guardianId: { $exists: false } }, { guardianId: null }]
      },
      { guardianId: req.user._id }
    );

    const requests = await Guardian.find({
      guardianId: req.user.id,
      status: 'pending'
    }).populate('userId', 'name email phone avatar');

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept or Reject Guardian Request
 */
const updateRequestStatus = async (req, res, next) => {
  const { requestId, status } = req.body;
  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be approved or rejected' });
    }

    const request = await Guardian.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Guardian request not found' });
    }

    if (request.guardianId?.toString() !== req.user.id && request.guardianEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this request' });
    }

    request.status = status;
    request.guardianId = req.user.id;
    await request.save();

    await Notification.create({
      recipientId: request.userId,
      title: `Guardian Request ${status === 'approved' ? 'Accepted' : 'Rejected'}`,
      message: `${req.user.name} has ${status} your request to be their guardian.`,
      type: 'system'
    });

    res.status(200).json({ success: true, message: `Guardian request ${status} successfully.`, request });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Users monitored by current user (approved guardianships)
 */
const getMonitoredUsers = async (req, res, next) => {
  try {
    const links = await Guardian.find({
      guardianId: req.user.id,
      status: 'approved'
    }).populate('userId', 'name email phone avatar');

    const monitoredUsers = await Promise.all(
      links.map(async (link) => {
        const user = link.userId;
        if (!user) return null;

        const latestSos = await SOSAlert.findOne({ userId: user._id }).sort({ createdAt: -1 });

        return {
          connectionId: link._id,
          relationship: link.relationship,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar
          },
          latestSos: latestSos
            ? {
                id: latestSos._id,
                status: latestSos.status,
                location: latestSos.location,
                batteryLevel: latestSos.batteryLevel,
                createdAt: latestSos.createdAt
              }
            : null
        };
      })
    );

    const filtered = monitoredUsers.filter((item) => item !== null);
    res.status(200).json({ success: true, count: filtered.length, monitoredUsers: filtered });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove Guardian / Monitored relation
 */
const removeGuardianRelation = async (req, res, next) => {
  try {
    const relation = await Guardian.findById(req.params.id);
    if (!relation) {
      return res.status(404).json({ success: false, message: 'Guardian relationship not found' });
    }

    if (relation.userId.toString() !== req.user.id && relation.guardianId?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to remove this relationship' });
    }

    await Guardian.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Guardian relationship removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addGuardian,
  getGuardians,
  getGuardianRequests,
  updateRequestStatus,
  getMonitoredUsers,
  removeGuardianRelation
};
