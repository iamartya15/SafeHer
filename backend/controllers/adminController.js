const User = require('../models/User');
const IncidentReport = require('../models/IncidentReport');
const SOSAlert = require('../models/SOSAlert');

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
      stats: {
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
      count: users.length,
      users
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
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      user
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
    const report = await IncidentReport.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Incident report not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
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
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  deleteFakeReport,
  getSOSLogs
};
