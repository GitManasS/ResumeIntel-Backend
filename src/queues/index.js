import { connectRedis, isRedisAvailable } from '../config/redis.js';
import { getResumeQueue } from './resume.queue.js';
import { getEmailQueue } from './email.queue.js';
import logger from '../utils/logger.js';

export const initQueues = async () => {
  if (!isRedisAvailable()) {
    logger.info('Redis disabled (REDIS_ENABLED=false). Background jobs run inline.');
    return false;
  }

  const connected = await connectRedis();
  if (!connected) {
    return false;
  }

  getResumeQueue();
  getEmailQueue();
  logger.info('BullMQ queues initialized');
  return true;
};
