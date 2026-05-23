import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, env.jwt.secret);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('join:organization', (orgId) => {
      if (orgId) socket.join(`org:${orgId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.userId}`);
    });
  });

  logger.info('Socket.io initialized');
  return io;
};

export const getIO = () => io;

export const emitToUser = (userId, event, payload) => {
  io?.to(`user:${userId}`).emit(event, payload);
};

export const emitToOrganization = (orgId, event, payload) => {
  io?.to(`org:${orgId}`).emit(event, payload);
};

export const emitNotification = (userId, notification) => {
  emitToUser(userId, 'notification:new', notification);
};

export const emitPipelineUpdate = (orgId, payload) => {
  emitToOrganization(orgId, 'pipeline:updated', payload);
};
