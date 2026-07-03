const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('[MongoDB] Connection Error: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  // Parse and fix if database name is missing
  let resolvedUri = uri;
  try {
    // Replace scheme prefix with http:// to parse easily with URL API
    const tempUrl = uri.replace('mongodb+srv://', 'http://').replace('mongodb://', 'http://');
    const urlObj = new URL(tempUrl);
    
    if (!urlObj.pathname || urlObj.pathname === '/') {
      const qIndex = uri.indexOf('?');
      if (qIndex !== -1) {
        resolvedUri = uri.slice(0, qIndex) + 'safeher' + uri.slice(qIndex);
      } else {
        resolvedUri = uri.endsWith('/') ? uri + 'safeher' : uri + '/safeher';
      }
      console.log(`[MongoDB] Automatically appended default database name 'safeher' to MONGODB_URI.`);
    }
  } catch (err) {
    console.error(`[MongoDB] Failed to parse MONGODB_URI: ${err.message}`);
  }

  try {
    // Mask password for security logs
    const maskedUri = resolvedUri.replace(/:([^:@]+)@/, ':******@');
    console.log(`[MongoDB] Connecting to database using URI: ${maskedUri}`);

    const conn = await mongoose.connect(resolvedUri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });

    console.log(`[MongoDB] Successful Connection. Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection Failed!`);
    console.error(`Error Details: ${error.message}`);
    console.error(`Please ensure your MongoDB Atlas IP Access List allows connections from your current IP.`);
    process.exit(1);
  }
};

module.exports = connectDB;
