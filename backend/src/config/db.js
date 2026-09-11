import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../utils/logger.js';
import { User } from '../models/User.js';

/**
 * Connects to MongoDB using Mongoose.
 * 
 * Why it exists: Centralized database connection logic.
 * What it does: Connects to the MONGO_URI specified in .env.
 * How it connects: Called in server.js before starting the Express server.
 */
export const connectDB = async () => {
  let isConnected = false;
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    isConnected = true;
  } catch (error) {
    logger.warn(`Primary MongoDB connection error (${error.message}). Trying local fallback...`);
    
    // Attempt local MongoDB fallback
    try {
      const fallbackConn = await mongoose.connect('mongodb://127.0.0.1:27017/resumind', {
        serverSelectionTimeoutMS: 2500,
      });
      logger.info(`Fallback MongoDB connected: ${fallbackConn.connection.host}`);
      isConnected = true;
    } catch (fallbackError) {
      logger.error(`Fallback MongoDB connection failed: ${fallbackError.message}`);
    }
  }

  if (isConnected) {
    try {
      await User.syncIndexes();
    } catch (syncErr) {
      logger.warn(`User index sync notice: ${syncErr.message}`);
    }
    return;
  }

  process.exit(1);
};
