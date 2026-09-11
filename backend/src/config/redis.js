import { createClient } from 'redis';
import { env } from './env.js';

/**
 * Redis client initialization.
 * 
 * Why it exists: Provides a single Redis connection instance for the app.
 * What it does: Connects to Redis server for caching or pub/sub. Note that BullMQ creates its own Redis connections.
 */
import logger from '../utils/logger.js';

export const getRedisConnectionOptions = () => {
  if (env.REDIS_URL) {
    const isTls = env.REDIS_URL.startsWith('rediss://');
    return {
      url: env.REDIS_URL,
      socket: {
        reconnectStrategy: false,
        connectTimeout: 3000,
        ...(isTls && { tls: true, rejectUnauthorized: false }),
      },
    };
  }
  return {
    socket: {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT) || 6379,
      reconnectStrategy: false,
      connectTimeout: 3000,
    },
    ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD }),
  };
};

export const redisClient = createClient(getRedisConnectionOptions());

redisClient.on('error', (err) => {
  logger.warn(`Redis client notification: ${err.message}`);
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

export const connectRedis = async ({ required = false } = {}) => {
  try {
    if (!redisClient.isOpen) {
      await Promise.race([
        redisClient.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 3000)),
      ]);
    }
    return true;
  } catch (error) {
    logger.warn(`Redis is offline or unreachable (${error.message}). App running with reliable direct execution.`);
    if (required) {
      throw error;
    }
    return false;
  }
};
