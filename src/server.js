import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { configureCloudinary } from './config/cloudinary.js';
import { initQueues } from './queues/index.js';
import { initSocket } from './websocket/socket.js';
import { eventBus } from './events/eventBus.js';
import { registerAutomationHandlers } from './events/handlers/automation.handler.js';
import { emitPipelineUpdate, emitNotification } from './websocket/socket.js';
import { EVENTS } from './events/eventBus.js';
import logger from './utils/logger.js';

const wireRealtimeEvents = () => {
  registerAutomationHandlers(eventBus);

  eventBus.on(EVENTS.APPLICATION_STAGE_CHANGED, ({ application, toStage, organizationId }) => {
    emitPipelineUpdate(organizationId, {
      applicationId: application._id,
      stage: toStage,
      jobId: application.job,
    });
  });

  eventBus.on(EVENTS.NOTE_ADDED, ({ note, organizationId, mentions }) => {
    emitPipelineUpdate(organizationId, { type: 'note', applicationId: note.application });
    mentions?.forEach((userId) => {
      emitNotification(userId, { type: 'mention', noteId: note._id });
    });
  });
};

const startServer = async () => {
  await connectDatabase();
  configureCloudinary();
  await initQueues();
  wireRealtimeEvents();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    logger.info(`Hiring OS API running on port ${env.port} [${env.nodeEnv}]`);
    logger.info(`API docs: http://localhost:${env.port}/api/docs`);
    logger.info(`WebSocket: ws://localhost:${env.port}/socket.io`);
  });
};

startServer().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});
