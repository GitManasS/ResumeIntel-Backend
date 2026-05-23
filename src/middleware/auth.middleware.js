import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveEffectiveRole } from '../config/permissions.js';

const loadUserFromToken = async (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.accessToken;
  if (!token) return null;

  const decoded = jwt.verify(token, env.jwt.secret);
  const user = await User.findById(decoded.id).populate(
    'organization',
    'name slug industry branding website isActive'
  );
  if (!user || !user.isActive) return null;
  req.user = user;
  req.effectiveRole = resolveEffectiveRole(user);
  return user;
};

export const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  try {
    await loadUserFromToken(req);
  } catch {
    req.user = undefined;
    req.effectiveRole = undefined;
  }
  next();
});

export const authenticate = asyncHandler(async (req, _res, next) => {
  const user = await loadUserFromToken(req);
  if (!user) {
    throw ApiError.unauthorized('Access token required');
  }
  next();
});

const roleMatches = (user, allowed) => {
  const effective = resolveEffectiveRole(user);
  const legacy = user.role;
  return allowed.includes(effective) || allowed.includes(legacy);
};

export const authorize = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!roleMatches(req.user, roles)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  });

export const authorizeStaff = () =>
  authorize(
    'super_admin',
    'org_admin',
    'hr_manager',
    'recruiter',
    'interviewer',
    'admin',
    'recruiter'
  );
