const mongoose = require("mongoose");
const { logger } = require('../utils/logger');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined.");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    logger.info(
      `✅ MongoDB Connected:`
    );
  } catch (error) {
    logger.error("❌ MongoDB Connection Failed");
    logger.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;