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
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required',
        data: null
      });
    }

    const guardianEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guardianEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
        data: null
      });
    }

    if (guardianEmail === req.user.email.toLowerCase().trim()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot add yourself as a guardian',
        data: null
      });
    }

    // Verify guardian user exists
    const guardianUser = await User.findOne({ email: guardianEmail });
    if (!guardianUser) {
      return res.status(404).json({
        success: false,
        message: 'No registered user found with this email on SafeHer AI.',
        data: null
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Atomic lookup to avoid duplicates
    let invite = await Guardian.findOne({ userId: req.user.id, guardianEmail });

    if (invite) {
      if (invite.status === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'This contact is already connected as your guardian.',
          data: null
        });
      }

      if (invite.status === 'pending') {
        return res.status(409).json({
          success: false,
          message: 'A pending guardian request has already been sent to this user.',
          data: null
        });
      }

      // If status is rejected, cancelled, or removed — reset to pending
      invite.status = 'pending';
      invite.relationship = relationship || 'Contact';
      invite.guardianId = guardianUser._id;
      await invite.save();
    } else {
      invite = await Guardian.create({
        userId: req.user.id,
        guardianEmail,
        guardianId: guardianUser._id,
        relationship: relationship || 'Contact',
        status: 'pending'
      });
    }

    // Create Notification
    await Notification.create({
      recipientId: guardianUser._id,
      title: 'New Guardian Request',
      message: `${req.user.name} has requested you to be their safety guardian.`,
      type: 'guardian_request'
    });

    // Professional HTML email invitation
    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0f172a; color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: bold; color: #a855f7;">🛡️ SafeHer AI</span>
        </div>
        <hr style="border: 0; border-top: 1px solid #334155; margin-bottom: 24px;" />
        <h2 style="color: #ffffff; text-align: center; font-size: 20px; margin-top: 0;">New Guardian Invitation</h2>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">Hello <strong>${guardianUser.name}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
          <strong>${req.user.name}</strong> has invited you to be their safety guardian on SafeHer AI with the relationship: <span style="color: #a855f7; font-weight: bold;">${relationship || 'Contact'}</span>.
        </p>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
          As a guardian, you will receive real-time location tracking and immediate emergency notifications if they ever trigger an SOS alert.
        </p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${frontendUrl}/guardian" style="background-color: #a855f7; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">
            Accept Request inside SafeHer
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; text-align: center;">
          Please log in to your SafeHer dashboard to accept or decline this safety guardian request.
        </p>
        <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;" />
        <p style="font-size: 11px; color: #64748b; text-align: center; margin-bottom: 0;">This email was sent by SafeHer AI Safety Dispatch. Please do not reply directly to this mail.</p>
      </div>
    `;

    sendMailAsync({
      to: guardianEmail,
      subject: `🛡️ New Guardian Request from ${req.user.name} - SafeHer AI`,
      text: `Hello ${guardianUser.name}, ${req.user.name} has requested you to be their safety guardian on SafeHer. Please log in to accept.`,
      html: emailHtml
    });

    res.status(201).json({
      success: true,
      message: 'Guardian request sent successfully.',
      data: invite
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User's Guardians (sent invites)
 */
const getGuardians = async (req, res, next) => {
  try {
    const list = await Guardian.find({
      userId: req.user.id,
      status: { $ne: 'removed' }
    }).populate('guardianId', 'name email phone avatar role');

    res.status(200).json({
      success: true,
      message: 'Guardians list retrieved successfully',
      data: list
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Requests Received (When current user is the guardian)
 */
const getGuardianRequests = async (req, res, next) => {
  try {
    const requests = await Guardian.find({
      guardianId: req.user.id,
      status: 'pending'
    }).populate('userId', 'name email phone avatar');

    res.status(200).json({
      success: true,
      message: 'Pending guardian requests retrieved successfully',
      data: requests
    });
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
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected',
        data: null
      });
    }

    const request = await Guardian.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Guardian request not found',
        data: null
      });
    }

    // Security check: Only the designated guardian can respond
    if (request.guardianId?.toString() !== req.user.id && request.guardianEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this request',
        data: null
      });
    }

    // Valid state transition check
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update request. Current status is ${request.status}`,
        data: null
      });
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

    res.status(200).json({
      success: true,
      message: `Guardian request ${status} successfully.`,
      data: request
    });
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
    res.status(200).json({
      success: true,
      message: 'Monitored users list retrieved successfully',
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove Guardian / Monitored relation (Cancel, Reject, or Disconnect)
 */
const removeGuardianRelation = async (req, res, next) => {
  try {
    const relation = await Guardian.findById(req.params.id);
    if (!relation) {
      return res.status(404).json({
        success: false,
        message: 'Guardian relationship not found',
        data: null
      });
    }

    // Security check: Only sender (userId) or receiver (guardianId) can remove
    const isSender = relation.userId.toString() === req.user.id;
    const isReceiver = relation.guardianId?.toString() === req.user.id;

    if (!isSender && !isReceiver) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this relationship',
        data: null
      });
    }

    // Complete Invitation Lifecycle implementation
    if (relation.status === 'pending') {
      if (isSender) {
        // Sender cancels invitation
        relation.status = 'cancelled';
        await relation.save();
        return res.status(200).json({
          success: true,
          message: 'Guardian invitation cancelled successfully.',
          data: relation
        });
      } else {
        // Receiver rejects/declines invitation
        relation.status = 'rejected';
        await relation.save();
        return res.status(200).json({
          success: true,
          message: 'Guardian request rejected successfully.',
          data: relation
        });
      }
    } else if (relation.status === 'approved') {
      // Approved connection is removed/disconnected
      relation.status = 'removed';
      await relation.save();
      return res.status(200).json({
        success: true,
        message: 'Guardian connection removed successfully.',
        data: relation
      });
    } else {
      // Rejected, Cancelled, or Removed entries can be deleted completely to clean up
      await Guardian.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Guardian history record deleted successfully.',
        data: null
      });
    }
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
