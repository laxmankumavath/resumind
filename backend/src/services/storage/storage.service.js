import cloudinary from '../../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { ApiError } from '../../utils/ApiError.js';
import { env } from '../../config/env.js';
import logger from '../../utils/logger.js';

/**
 * Storage Service
 * 
 * Why it exists: Abstracts file storage away from controllers.
 * What it does: Uploads local files to Cloudinary and deletes the local temporary file.
 */
export const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) throw new ApiError(400, 'No file path provided');

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // Auto-detect PDF vs Image
      folder: 'resumind_uploads',
    });

    // Clean up local file asynchronously
    fs.unlink(localFilePath, (err) => {
      if (err) console.error('Failed to delete local file:', err);
    });

    return result.secure_url;
  } catch (error) {
    const cloudinaryMessage = error?.message
      || error?.error?.message
      || error?.error?.code
      || 'Unknown Cloudinary upload error';

    if (env.NODE_ENV !== 'production' || process.env.ALLOW_LOCAL_UPLOAD_FALLBACK === 'true') {
      const localUploadPath = `/uploads/${path.basename(localFilePath)}`;
      logger.warn(`Cloudinary upload failed (${cloudinaryMessage}). Using local upload fallback: ${localUploadPath}`);
      return localUploadPath;
    }

    // Attempt cleanup even on failure
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new ApiError(502, `File upload failed: ${cloudinaryMessage}`);
  }
};
