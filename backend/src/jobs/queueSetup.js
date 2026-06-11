import { Queue } from 'bullmq';
import net from 'net';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * BullMQ Queue Initialization
 * 
 * Why it exists: Sets up the Redis-backed queues for background processing.
 * What it does: Creates queue instances that the controllers can add jobs to.
 */

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
};

const assertRedisAvailable = () => new Promise((resolve, reject) => {
  const socket = net.createConnection({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  });

  socket.setTimeout(500);
  socket.once('connect', () => {
    socket.end();
    resolve();
  });
  socket.once('timeout', () => {
    socket.destroy();
    reject(new Error('Redis connection timed out'));
  });
  socket.once('error', reject);
});

const addJob = async (queueName, jobName, data) => {
  await assertRedisAvailable();
  const queue = new Queue(queueName, { connection });
  logger.info(`Queue add request: queue=${queueName} job=${jobName} payload=${JSON.stringify(data)}`);

  try {
    const job = await queue.add(jobName, data);
    logger.info(`Job added: id=${job.id} queue=${queueName}`);
    return job;
  } finally {
    await queue.close();
  }
};

// Queue for heavy ATS analysis (using Gemini or heavy NLP)
export const addAnalysisJob = (data) => addJob('AnalysisQueue', 'analyze', data);

// Queue for Resume Rewriting (uses Gemini)
export const addRewriteJob = (data) => addJob('RewriteQueue', 'rewrite', data);
