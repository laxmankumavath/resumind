import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connects to MongoDB using Mongoose.
 * 
 * Why it exists: Centralized database connection logic.
 * What it does: Connects to the MONGO_URI specified in .env.
 * How it connects: Called in server.js before starting the Express server.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
