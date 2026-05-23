import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { resolveEffectiveRole } from '../config/permissions.js';
import Organization from '../models/Organization.js';

export const attachOrganization = asyncHandler(async (req, _res, next) => {
  const effective = resolveEffectiveRole(req.user);

  if (effective === 'super_admin') {
    const orgId = req.headers['x-organization-id'] || req.query.organizationId;
    if (orgId) {
      req.organization = await Organization.findById(orgId);
    }
    return next();
  }

  if (!req.user.organization) {
    throw ApiError.forbidden('No organization associated with your account');
  }

  req.organization = await Organization.findById(req.user.organization);
  if (!req.organization?.isActive) {
    throw ApiError.forbidden('Organization inactive or not found');
  }

  req.organizationId = req.organization._id;
  next();
});

export const requireOrganization = asyncHandler(async (req, _res, next) => {
  const effective = resolveEffectiveRole(req.user);

  if (effective === 'super_admin') {
    const orgId = req.headers['x-organization-id'] || req.query.organizationId || req.user.organization;
    if (orgId) {
      req.organization = await Organization.findById(orgId);
      req.organizationId = req.organization?._id;
    }
  } else if (req.user.organization) {
    req.organization = await Organization.findById(req.user.organization);
    req.organizationId = req.organization?._id;
  }

  if (!req.organizationId || !req.organization?.isActive) {
    throw ApiError.forbidden('Organization context required');
  }
  next();
});
