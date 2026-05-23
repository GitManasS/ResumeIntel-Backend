import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors.push(...Object.values(err.errors).map((e) => e.message));
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message}`, { stack: err.stack, path: req.path });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length ? errors : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
