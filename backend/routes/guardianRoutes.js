const express = require('express');
const router = express.Router();
const {
  addGuardian,
  getGuardians,
  getGuardianRequests,
  updateRequestStatus,
  getMonitoredUsers,
  removeGuardianRelation
} = require('../controllers/guardianController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/add', addGuardian);
router.get('/', getGuardians);
router.get('/requests', getGuardianRequests);
router.post('/requests/respond', updateRequestStatus);
router.get('/monitored-users', getMonitoredUsers);
router.delete('/:id', removeGuardianRelation);

module.exports = router;
