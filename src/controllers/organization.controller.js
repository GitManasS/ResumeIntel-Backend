import organizationService from '../services/organization.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listOrganizations = asyncHandler(async (_req, res) => {
  const organizations = await organizationService.list();
  res.json({ success: true, data: organizations });
});

export const getOrganization = asyncHandler(async (req, res) => {
  const data = await organizationService.getById(req.params.orgId);
  res.json({ success: true, data });
});

export const createOrganization = asyncHandler(async (req, res) => {
  const organization = await organizationService.create(req.body);
  res.status(201).json({ success: true, data: organization });
});

export const updateOrganization = asyncHandler(async (req, res) => {
  const organization = await organizationService.update(req.params.orgId, req.body);
  res.json({ success: true, data: organization });
});

export const listMembers = asyncHandler(async (req, res) => {
  const members = await organizationService.listMembers(req.params.orgId);
  res.json({ success: true, data: members });
});

export const addMember = asyncHandler(async (req, res) => {
  const user = await organizationService.addMember(req.params.orgId, req.body);
  res.status(201).json({ success: true, data: user });
});

export const updateMember = asyncHandler(async (req, res) => {
  const user = await organizationService.updateMember(
    req.params.orgId,
    req.params.userId,
    req.body
  );
  res.json({ success: true, data: user });
});

export const removeMember = asyncHandler(async (req, res) => {
  const result = await organizationService.removeMember(req.params.orgId, req.params.userId);
  res.json({ success: true, ...result });
});
