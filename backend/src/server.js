import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { startAnalysisWorker } from './jobs/analysis.worker.js';
import { startRewriteWorker } from './jobs/rewrite.worker.js';
import logger from './utils/logger.js';

/**
 * Application Entry Point
 * 
 * Why it exists: Starts the HTTP server and manages infrastructure connections.
 * What it does: Immediately binds port for cloud hosting (Render/Vercel) and connects to MongoDB/Redis.
 */

const startServer = async () => {
  try {
    // 1. Start Express Server immediately so cloud hosting providers detect the open port
    const PORT = process.env.PORT || env.PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });

    // 2. Connect to Infrastructure
    const dbConnected = await connectDB();
    if (!dbConnected && env.NODE_ENV === 'production') {
      logger.warn('Server is running, but database connection could not be established. Please verify MONGO_URI.');
    }

    const redisConnected = await connectRedis();
    if (redisConnected) {
      try {
        startAnalysisWorker();
        startRewriteWorker();
        logger.info('Background workers initialized with server');
      } catch (workerErr) {
        logger.warn(`Could not start workers with server: ${workerErr.message}`);
      }
    } else {
      logger.warn('Redis is not connected. Background worker queues will be offline.');
    }

    // Handle Unhandled Rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
    });

    // Handle graceful shutdown (Ctrl+C / SIGTERM)
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated.');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();


