const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary Configured successfully.');
} else {
  console.warn('Cloudinary credentials missing. Falling back to local file storage for uploads.');
}

/**
 * Uploads a file to Cloudinary, or saves it to local public/uploads directory as a fallback.
 * @param {string} localFilePath - Path of the file on disk
 * @param {string} folder - Destination folder name
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadImage = async (localFilePath, folder = 'safeher') => {
  try {
    if (!localFilePath) {
      throw new Error('Local file path is required');
    }

    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folder,
        resource_type: 'auto'
      });
      // Delete temporary file from local disk
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }
      return {
        url: result.secure_url,
        public_id: result.public_id
      };
    } else {
      // Fallback: Move file to public static folder
      const fileName = path.basename(localFilePath);
      const publicDir = path.join(__dirname, '..', 'public', 'uploads');
      
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const destPath = path.join(publicDir, fileName);
      fs.copyFileSync(localFilePath, destPath);
      
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }

      const port = process.env.PORT || 5000;
      const url = `http://localhost:${port}/uploads/${fileName}`;
      
      return {
        url: url,
        public_id: fileName
      };
    }
  } catch (error) {
    console.error('Upload Error:', error);
    // Attempt cleanup if file exists
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (e) {}
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  isCloudinaryConfigured
};
