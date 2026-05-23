import { Queue, Worker } from 'bullmq';
import { getRedisClient, isRedisAvailable } from '../config/redis.js';
import resumeService from '../services/resume.service.js';
import logger from '../utils/logger.js';

let resumeQueue = null;

export const getResumeQueue = () => {
  if (!isRedisAvailable()) return null;

  const connection = getRedisClient();
  if (!connection) return null;

  if (!resumeQueue) {
    resumeQueue = new Queue('resume-processing', { connection });

    new Worker(
      'resume-processing',
      async (job) => {
        const { resumeId, buffer, mimetype } = job.data;
        await resumeService.parseResumeAsync(resumeId, Buffer.from(buffer), mimetype);
      },
      { connection }
    );

    logger.info('Resume queue worker started');
  }

  return resumeQueue;
};

export const enqueueResumeParse = async (resumeId, buffer, mimetype) => {
  const queue = getResumeQueue();
  if (queue) {
    await queue.add('parse', { resumeId, buffer: buffer.toJSON(), mimetype });
    return true;
  }
  return false;
};
