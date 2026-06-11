import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

/**
 * Cloudinary configuration.
 * 
 * Why it exists: Centralizes the setup of the Cloudinary SDK.
 * What it does: Configures Cloudinary with credentials from the environment.
 * How it connects: Used by the storage.service.js to upload parsed resumes.
 */
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

export default cloudinary;
