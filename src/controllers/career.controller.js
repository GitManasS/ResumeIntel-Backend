import careerPortalService from '../services/careerPortal.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getOrg = asyncHandler(async (req, res) => {
  const org = await careerPortalService.getOrganizationBySlug(req.params.slug);
  res.json({ success: true, data: org });
});

export const getJobs = asyncHandler(async (req, res) => {
  const data = await careerPortalService.getPublicJobs(req.params.slug, req.query);
  res.json({ success: true, data });
});

export const getJob = asyncHandler(async (req, res) => {
  const data = await careerPortalService.getPublicJob(req.params.slug, req.params.jobId);
  res.json({ success: true, data });
});
