const ChatHistory = require('../models/ChatHistory');
const { getSafetyAdvice } = require('../services/geminiService');

/**
 * Send Message to Gemini AI Safety Assistant
 */
const sendMessage = async (req, res, next) => {
  const { message } = req.body;
  try {
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // 1. Fetch or initialize chat history for the user
    let chat = await ChatHistory.findOne({ userId: req.user.id });
    if (!chat) {
      chat = await ChatHistory.create({ userId: req.user.id, messages: [] });
    }

    // 2. Fetch safety advice from Gemini service
    const advice = await getSafetyAdvice(message, chat.messages);

    // 3. Save conversation exchanges to MongoDB
    chat.messages.push({ role: 'user', content: message });
    chat.messages.push({ role: 'model', content: advice });
    await chat.save();

    res.status(200).json({
      success: true,
      reply: advice,
      history: chat.messages
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Chat History
 */
const getChatHistory = async (req, res, next) => {
  try {
    let chat = await ChatHistory.findOne({ userId: req.user.id });
    
    res.status(200).json({
      success: true,
      history: chat ? chat.messages : []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear Chat History
 */
const clearChatHistory = async (req, res, next) => {
  try {
    const chat = await ChatHistory.findOne({ userId: req.user.id });
    if (chat) {
      chat.messages = [];
      await chat.save();
    }

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully',
      history: []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  clearChatHistory
};
