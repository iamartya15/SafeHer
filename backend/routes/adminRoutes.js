const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUserRole,
  toggleBlockUser,
  deleteUser,
  getAllGuardians,
  removeGuardianConnection,
  deleteFakeReport,
  getSOSLogs
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/role', updateUserRole);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);
router.get('/guardians', getAllGuardians);
router.delete('/guardians/:id', removeGuardianConnection);
router.delete('/reports/:id', deleteFakeReport);
router.get('/sos-logs', getSOSLogs);

module.exports = router;
