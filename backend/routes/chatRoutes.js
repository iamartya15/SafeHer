const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  clearChatHistory
} = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/message', sendMessage);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

module.exports = router;
