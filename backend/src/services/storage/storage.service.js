import cloudinary from '../../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { ApiError } from '../../utils/ApiError.js';
import logger from '../../utils/logger.js';

/**
 * Storage Service
 * 
 * Why it exists: Abstracts file storage away from controllers.
 * What it does: Uploads local files to Cloudinary and falls back to local disk storage if Cloudinary is unavailable.
 */
export const uploadToCloudinary = async (localFilePath) => {
  if (!localFilePath || !fs.existsSync(localFilePath)) {
    throw new ApiError(400, 'File does not exist for upload');
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
      folder: 'resumind_uploads',
    });

    // Clean up local temporary file asynchronously on successful remote upload
    fs.unlink(localFilePath, (err) => {
      if (err) logger.warn(`Failed to delete local temporary file: ${err.message}`);
    });

    return result.secure_url;
  } catch (error) {
    const cloudinaryMessage = error?.message
      || error?.error?.message
      || error?.error?.code
      || 'Unknown Cloudinary upload error';

    // Fall back to local file serving path
    const fileName = path.basename(localFilePath);
    const localUploadPath = `/uploads/${fileName}`;
    logger.warn(`Cloudinary upload skipped/failed (${cloudinaryMessage}). Retaining local copy: ${localUploadPath}`);
    return localUploadPath;
  }
};
