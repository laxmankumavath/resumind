import { createClient } from 'redis';
import { env } from './env.js';

/**
 * Redis client initialization.
 * 
 * Why it exists: Provides a single Redis connection instance for the app.
 * What it does: Connects to Redis server for caching or pub/sub. Note that BullMQ creates its own Redis connections.
 */
export const redisClient = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    reconnectStrategy: false
  },
  ...(env.REDIS_PASSWORD && { password: env.REDIS_PASSWORD })
});

redisClient.on('error', (err) => console.log('Redis client error', err));
redisClient.on('connect', () => console.log('Redis client connected'));

export const connectRedis = async ({ required = false } = {}) => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return true;
  } catch (error) {
    console.error('Redis connection failed:', error);
    if (required) {
      throw error;
    }
    return false;
  }
};
