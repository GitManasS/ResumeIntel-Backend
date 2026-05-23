import { Queue, Worker } from 'bullmq';
import { getRedisClient, isRedisAvailable } from '../config/redis.js';
import { emailService } from '../services/email.service.js';
import logger from '../utils/logger.js';

let emailQueue = null;

export const getEmailQueue = () => {
  if (!isRedisAvailable()) return null;

  const connection = getRedisClient();
  if (!connection) return null;

  if (!emailQueue) {
    emailQueue = new Queue('email', { connection });

    new Worker(
      'email',
      async (job) => {
        await emailService.send(job.data);
      },
      { connection }
    );

    logger.info('Email queue worker started');
  }

  return emailQueue;
};

export const enqueueEmail = async (emailData) => {
  const queue = getEmailQueue();
  if (queue) {
    await queue.add('send', emailData);
    return true;
  }
  await emailService.send(emailData);
  return false;
};
