const express = require('express');
const router = express.Router();
const {
  triggerSOS,
  resolveSOS,
  getActiveSOS,
  getSOSHistory
} = require('../controllers/sosController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/trigger', triggerSOS);
router.put('/resolve/:id', resolveSOS);
router.get('/active', getActiveSOS);
router.get('/history', getSOSHistory);

module.exports = router;
