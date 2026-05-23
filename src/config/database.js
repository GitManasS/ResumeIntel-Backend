import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../utils/logger.js';

export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(env.mongodbUri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});
