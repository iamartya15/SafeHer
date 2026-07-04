const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined.");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      // ${conn.connection.host} | DB: ${conn.connection.name}
      `✅ MongoDB Connected:`
    );
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;