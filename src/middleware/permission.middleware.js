import { ApiError } from '../utils/ApiError.js';
import { hasPermission } from '../config/permissions.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requirePermission = (...permissions) =>
  asyncHandler(async (req, _res, next) => {
    const allowed = permissions.some((p) => hasPermission(req.user, p));
    if (!allowed) {
      throw ApiError.forbidden('Insufficient permissions');
    }
    next();
  });
