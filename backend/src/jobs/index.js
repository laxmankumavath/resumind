import { connectDB } from '../config/db.js';
import { connectRedis } from '../config/redis.js';
import { startAnalysisWorker } from './analysis.worker.js';
import { startRewriteWorker } from './rewrite.worker.js';
import logger from '../utils/logger.js';

const startWorkers = async () => {
  try {
    await connectDB();
    await connectRedis({ required: true });
    startAnalysisWorker();
    startRewriteWorker();
    logger.info('Background workers are running');
  } catch (error) {
    logger.error(`Failed to start workers: ${error.message}`);
    process.exit(1);
  }
};

startWorkers();
