const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUserRole,
  deleteFakeReport,
  getSOSLogs
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/role', updateUserRole);
router.delete('/reports/:id', deleteFakeReport);
router.get('/sos-logs', getSOSLogs);

module.exports = router;
