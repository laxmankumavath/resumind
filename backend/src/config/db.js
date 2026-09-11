import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../utils/logger.js';
import { User } from '../models/User.js';

// Configure public DNS resolvers to handle SRV lookups reliably across cloud providers
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore if custom DNS cannot be configured in the host environment
}

/**
 * Connects to MongoDB using Mongoose.
 * 
 * Why it exists: Centralized database connection logic.
 * What it does: Connects to the MONGO_URI specified in .env.
 * How it connects: Called in server.js on startup.
 */
export const connectDB = async () => {
  let isConnected = false;
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    isConnected = true;
  } catch (error) {
    logger.warn(`Primary MongoDB connection error (${error.message})`);
    
    // Attempt local MongoDB fallback only in development
    if (env.NODE_ENV !== 'production') {
      try {
        const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/resumind', {
          serverSelectionTimeoutMS: 2500,
        });
        logger.info(`Fallback MongoDB connected: ${fallbackConn.connection.host}`);
        isConnected = true;
      } catch (fallbackError) {
        logger.error(`Fallback MongoDB connection failed: ${fallbackError.message}`);
      }
    } else {
      logger.error('CRITICAL: Failed to connect to MongoDB in production. Please check: 1) MONGO_URI in Render environment variables is correct. 2) MongoDB Atlas Network Access allows 0.0.0.0/0 (Access from Anywhere).');
    }
  }

  if (isConnected) {
    try {
      await User.syncIndexes();
    } catch (syncErr) {
      logger.warn(`User index sync notice: ${syncErr.message}`);
    }
    return true;
  }

  return false;
};
