import Notification from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { emitNotification } from '../websocket/socket.js';

export const notificationService = {
  async create({ user, type, title, message, link, metadata }) {
    const notification = await Notification.create({ user, type, title, message, link, metadata });
    emitNotification(user, notification);
    return notification;
  },

  async getByUser(userId, { page, limit, skip, unreadOnly }) {
    const query = { user: userId };
    if (unreadOnly) query.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort('-createdAt').skip(skip).limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);

    return { notifications, total, unreadCount };
  },

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) throw ApiError.notFound('Notification not found');
    return notification;
  },

  async markAllAsRead(userId) {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  },
};

export default notificationService;
