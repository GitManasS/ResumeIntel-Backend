import notificationService from '../services/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { notifications, total, unreadCount } = await notificationService.getByUser(
    req.user._id,
    { ...pagination, unreadOnly: req.query.unread === 'true' }
  );
  res.json({
    success: true,
    unreadCount,
    ...paginatedResponse(notifications, total, pagination.page, pagination.limit),
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  res.json({ success: true, data: notification });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.json({ success: true, message: 'All notifications marked as read' });
});
