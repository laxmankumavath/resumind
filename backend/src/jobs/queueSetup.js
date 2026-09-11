import { Queue } from 'bullmq';
import { env } from '../config/env.js';
import { redisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * BullMQ Queue Initialization
 * 
 * Sets up Redis-backed queues for background processing with TLS and fallback support.
 */

export const getBullMQConnectionOptions = () => {
  if (env.REDIS_URL) {
    try {
      const parsed = new URL(env.REDIS_URL);
      const isTls = env.REDIS_URL.startsWith('rediss://');
      return {
        host: parsed.hostname,
        port: Number(parsed.port) || 6379,
        username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
        password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        connectTimeout: 4000,
        ...(isTls && { tls: { rejectUnauthorized: false } }),
      };
    } catch (_err) {
      // Fallback
    }
  }

  return {
    host: env.REDIS_HOST,
    port: Number(env.REDIS_PORT) || 6379,
    password: env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    connectTimeout: 4000,
  };
};

export const isRedisReady = async () => {
  try {
    if (!redisClient.isOpen) {
      await Promise.race([
        redisClient.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 2500)),
      ]);
    }
    const pong = await redisClient.ping();
    return pong === 'PONG';
  } catch (error) {
    logger.warn(`Redis readiness check failed: ${error.message}`);
    return false;
  }
};

const addJob = async (queueName, jobName, data) => {
  const ready = await isRedisReady();
  if (!ready) {
    throw new Error(`Redis is not available for ${queueName}`);
  }

  const connection = getBullMQConnectionOptions();
  const queue = new Queue(queueName, { connection });
  logger.info(`Queue add request: queue=${queueName} job=${jobName}`);

  try {
    const job = await queue.add(jobName, data, {
      removeOnComplete: 100,
      removeOnFail: 50,
    });
    logger.info(`Job added: id=${job.id} queue=${queueName}`);
    return job;
  } finally {
    await queue.close();
  }
};

// Queue for heavy ATS analysis
export const addAnalysisJob = (data) => addJob('AnalysisQueue', 'analyze', data);

// Queue for Resume Rewriting
export const addRewriteJob = (data) => addJob('RewriteQueue', 'rewrite', data);
