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
 * Why it exists: Starts the application and manages infrastructure connections.
 * What it does: Connects to MongoDB, Redis, starts background workers, and listens for HTTP requests.
 * Reloaded with updated environment configurations.
 */

const startServer = async () => {
  try {
    // 1. Connect to Infrastructure
    await connectDB();
    const redisConnected = await connectRedis();

    if (redisConnected) {
      try {
        startAnalysisWorker();
        startRewriteWorker();
        logger.info('Background workers initialized with server');
      } catch (workerErr) {
        logger.warn(`Could not start workers with server: ${workerErr.message}`);
      }
    }

    // 2. Start Express Server
    const PORT = env.PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle Unhandled Rejections (e.g., Database connection failure after startup)
    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

    // Handle graceful shutdown (Ctrl+C)
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


