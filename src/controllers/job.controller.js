import jobService from '../services/job.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import { normalizeOrgId } from '../utils/orgId.js';

const resolveOrgId = (req) =>
  normalizeOrgId(req.organizationId || req.user?.organization);

export const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.create(req.user._id, resolveOrgId(req), req.body);
  res.status(201).json({ success: true, data: job });
});

export const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.update(req.params.id, req.user._id, req.body);
  res.json({ success: true, data: job });
});

export const deleteJob = asyncHandler(async (req, res) => {
  await jobService.delete(req.params.id, req.user._id);
  res.json({ success: true, message: 'Job deleted' });
});

export const getMyJobs = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const orgId = resolveOrgId(req);
  const { jobs, total, page, limit } = await jobService.getRecruiterJobs(
    req.user._id,
    pagination,
    orgId
  );
  res.json({
    success: true,
    ...paginatedResponse(jobs, total, page, limit),
  });
});

export const getJobs = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const filters = {};
  if (req.query.search) filters.search = req.query.search;
  let { jobs, total, page, limit } = await jobService.getActiveJobs(pagination, filters);

  const isCandidate = req.user?.role === 'candidate' && !req.user?.orgRole;
  if (isCandidate) {
    jobs = await jobService.attachApplicationStatusToJobs(jobs, req.user._id);
  }

  res.json({
    success: true,
    ...paginatedResponse(jobs, total, page, limit),
  });
});

export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await jobService.getCandidateApplications(req.user._id);
  res.json({ success: true, data: applications });
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await jobService.getById(req.params.id);
  const isCandidate = req.user?.role === 'candidate' && !req.user?.orgRole;
  const data = isCandidate
    ? await jobService.formatJobForCandidate(job, req.user._id)
    : job;
  res.json({ success: true, data });
});

export const applyJob = asyncHandler(async (req, res) => {
  const job = await jobService.apply(req.params.id, req.user._id, req.body.resumeId);
  res.json({ success: true, data: job });
});

export const shortlistCandidate = asyncHandler(async (req, res) => {
  const job = await jobService.shortlist(
    req.params.jobId,
    req.user._id,
    req.params.candidateId
  );
  res.json({ success: true, data: job });
});

export const rankCandidates = asyncHandler(async (req, res) => {
  const rankings = await jobService.rankCandidates(req.params.id, req.user._id);
  res.json({ success: true, data: rankings });
});

export const searchCandidates = asyncHandler(async (req, res) => {
  const results = await jobService.searchCandidates(req.user._id, req.query);
  res.json({ success: true, data: results });
});
