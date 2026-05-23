import Redis from 'ioredis';
import { env } from './env.js';
import logger from '../utils/logger.js';

let redisClient = null;

export const isRedisAvailable = () => env.redisEnabled;

export const getRedisClient = () => {
  if (!isRedisAvailable()) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => {
      if (err.message) logger.warn(`Redis: ${err.message}`);
    });
  }

  return redisClient;
};

export const connectRedis = async () => {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.connect();
    return true;
  } catch (err) {
    logger.warn(`Redis unavailable — background jobs disabled (${err.message})`);
    redisClient = null;
    return false;
  }
};

export const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit().catch(() => {});
    redisClient = null;
  }
};
