const Guardian = require('../models/Guardian');
const User = require('../models/User');
const SOSAlert = require('../models/SOSAlert');
const Notification = require('../models/Notification');

/**
 * Add a Guardian
 */
const addGuardian = async (req, res, next) => {
  const { email, relationship } = req.body;
  try {
    const guardianEmail = email.toLowerCase().trim();

    if (guardianEmail === req.user.email) {
      return res.status(400).json({ success: false, message: 'You cannot add yourself as a guardian' });
    }

    // Check if relationship already exists
    const existing = await Guardian.findOne({
      userId: req.user.id,
      guardianEmail
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'This guardian has already been added' });
    }

    // Check if the guardian is registered as a user
    const guardianUser = await User.findOne({ email: guardianEmail });
    
    const newRequest = await Guardian.create({
      userId: req.user.id,
      guardianEmail,
      guardianId: guardianUser ? guardianUser._id : undefined,
      relationship: relationship || 'Contact',
      status: 'pending'
    });

    // Notify guardian if registered
    if (guardianUser) {
      await Notification.create({
        recipientId: guardianUser._id,
        title: 'New Guardian Request',
        message: `${req.user.name} has requested you to be their safety guardian.`,
        type: 'guardian_request'
      });
    }

    res.status(201).json({
      success: true,
      message: guardianUser 
        ? 'Guardian request sent successfully.' 
        : 'Guardian is not yet registered. An invitation has been sent, and they will be linked once registered.',
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
    
    res.status(200).json({
      success: true,
      count: list.length,
      guardians: list
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
    // Find requests where guardianEmail matches current user's email and status is pending
    // Also update guardianId in the record if it is not set (backfill on register)
    await Guardian.updateMany(
      { guardianEmail: req.user.email, guardianId: { $exists: false } },
      { guardianId: req.user._id }
    );

    const requests = await Guardian.find({
      guardianId: req.user.id,
      status: 'pending'
    }).populate('userId', 'name email phone avatar');

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept or Reject Guardian Request
 */
const updateRequestStatus = async (req, res, next) => {
  const { requestId, status } = req.body; // status: 'approved' or 'rejected'
  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be approved or rejected' });
    }

    const request = await Guardian.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Guardian request not found' });
    }

    // Check if the current user is the guardian
    if (request.guardianId?.toString() !== req.user.id && request.guardianEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this request' });
    }

    request.status = status;
    request.guardianId = req.user.id; // ensure ID is linked
    await request.save();

    // Notify the user of the decision
    await Notification.create({
      recipientId: request.userId,
      title: `Guardian Request ${status === 'approved' ? 'Accepted' : 'Rejected'}`,
      message: `${req.user.name} has ${status} your request to be their guardian.`,
      type: 'system'
    });

    res.status(200).json({
      success: true,
      message: `Guardian request ${status} successfully.`,
      request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Users who have added the current user as an approved guardian (Monitored Users)
 * Includes their latest SOS status and location
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

        // Find the user's latest SOS alert (active or resolved)
        const latestSos = await SOSAlert.findOne({ userId: user._id })
          .sort({ createdAt: -1 });

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
          latestSos: latestSos ? {
            id: latestSos._id,
            status: latestSos.status,
            location: latestSos.location,
            batteryLevel: latestSos.batteryLevel,
            createdAt: latestSos.createdAt
          } : null
        };
      })
    );

    const filtered = monitoredUsers.filter(item => item !== null);

    res.status(200).json({
      success: true,
      count: filtered.length,
      monitoredUsers: filtered
    });
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

    // Authorized if user is the ward or the guardian
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
