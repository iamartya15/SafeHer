const User = require('../models/User');
const IncidentReport = require('../models/IncidentReport');
const SOSAlert = require('../models/SOSAlert');
const Guardian = require('../models/Guardian');
const mongoose = require('mongoose');

/**
 * Get basic statistics for admin dashboard
 */
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalReports = await IncidentReport.countDocuments();
    const totalSos = await SOSAlert.countDocuments();
    const activeSos = await SOSAlert.countDocuments({ status: 'active' });

    // Count reports by category
    const categoryStats = await IncidentReport.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format category stats for frontend chart/cards
    const categoriesCount = {
      Harassment: 0,
      Theft: 0,
      Stalking: 0,
      'Poor Lighting': 0,
      'Unsafe Area': 0,
      'Road Issue': 0
    };
    
    categoryStats.forEach(item => {
      if (categoriesCount[item._id] !== undefined) {
        categoriesCount[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      message: 'Admin stats retrieved successfully.',
      data: {
        totalUsers,
        totalReports,
        totalSos,
        activeSos,
        categories: categoriesCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Users list retrieved successfully.',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role
 */
const updateUserRole = async (req, res, next) => {
  const { userId, role } = req.body;
  try {
    if (!['user', 'guardian', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role', data: null });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID format', data: null });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role', data: null });
    }

    // Protect Super Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'amartyakushwaha30@gmail.com';
    if (user.email.toLowerCase().trim() === adminEmail.toLowerCase().trim()) {
      return res.status(403).json({ success: false, message: 'Super Administrator role cannot be modified.', data: null });
    }

    user.role = role;
    if (user.roles && !user.roles.includes(role)) {
      user.roles.push(role);
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Block / Unblock User
 */
const toggleBlockUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID format', data: null });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own account', data: null });
    }

    // Protect Super Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'amartyakushwaha30@gmail.com';
    if (user.email.toLowerCase().trim() === adminEmail.toLowerCase().trim()) {
      return res.status(403).json({ success: false, message: 'Super Administrator account cannot be suspended.', data: null });
    }

    user.isBlocked = !user.isBlocked;
    
    // Revoke token if blocking
    if (user.isBlocked) {
      user.refreshToken = undefined;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${user.isBlocked ? 'suspended' : 'activated'} successfully.`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete User
 */
const deleteUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID format', data: null });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account', data: null });
    }

    // Protect Super Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'amartyakushwaha30@gmail.com';
    if (user.email.toLowerCase().trim() === adminEmail.toLowerCase().trim()) {
      return res.status(403).json({ success: false, message: 'Super Administrator account cannot be deleted.', data: null });
    }

    await User.findByIdAndDelete(req.params.id);

    // Clean up guardian links
    await Guardian.deleteMany({
      $or: [{ userId: req.params.id }, { guardianId: req.params.id }]
    });

    res.status(200).json({
      success: true,
      message: 'User and associated links deleted successfully.',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Guardian Connections
 */
const getAllGuardians = async (req, res, next) => {
  try {
    const list = await Guardian.find()
      .populate('userId', 'name email phone')
      .populate('guardianId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'All guardian connections retrieved successfully.',
      data: list
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove Guardian Connection
 */
const removeGuardianConnection = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Connection ID format', data: null });
    }
    const connection = await Guardian.findByIdAndDelete(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: 'Guardian connection not found', data: null });
    }

    res.status(200).json({
      success: true,
      message: 'Guardian connection removed successfully.',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a fake incident report
 */
const deleteFakeReport = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid Report ID format', data: null });
    }
    const report = await IncidentReport.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Incident report not found', data: null });
    }

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all SOS logs
 */
const getSOSLogs = async (req, res, next) => {
  try {
    const logs = await SOSAlert.find()
      .populate('userId', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'SOS logs retrieved successfully.',
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  toggleBlockUser,
  deleteUser,
  getAllGuardians,
  removeGuardianConnection,
  deleteFakeReport,
  getSOSLogs
};
