import { searchCandidates } from '../repositories/candidateSearch.repository.js';
import {
  getOrganizationCandidates,
  getOrganizationSkills,
} from '../repositories/filterOptions.repository.js';
import hiringAnalyticsService from '../services/hiringAnalytics.service.js';
import collaborationService from '../services/collaboration.service.js';
import interviewScheduleService from '../services/interviewSchedule.service.js';
import talentPoolService from '../services/talentPool.service.js';
import activityService from '../services/activity.service.js';
import auditService from '../services/audit.service.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const filterCandidates = asyncHandler(async (req, res) => {
  const candidates = await getOrganizationCandidates(req.organizationId, req.query.q);
  res.json({
    success: true,
    data: candidates.map((c) => ({
      id: c._id,
      name: c.name,
      email: c.email,
      title: c.title,
      label: c.name,
      sublabel: c.email,
    })),
  });
});

export const filterSkills = asyncHandler(async (req, res) => {
  const skills = await getOrganizationSkills(req.organizationId, req.query.q);
  res.json({
    success: true,
    data: skills.map((s) => ({
      value: s.skill,
      label: s.skill,
      sublabel: `${s.count} candidate${s.count !== 1 ? 's' : ''}`,
    })),
  });
});

export const search = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const skills = req.query.skills
    ? (Array.isArray(req.query.skills) ? req.query.skills : req.query.skills.split(','))
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const { results, total } = await searchCandidates(
    req.organizationId,
    {
      search: req.query.search,
      skills,
      stage: req.query.stage,
      jobId: req.query.jobId,
      location: req.query.location,
      minMatchScore: req.query.minMatchScore ? Number(req.query.minMatchScore) : undefined,
      minAtsScore: req.query.minAtsScore ? Number(req.query.minAtsScore) : undefined,
    },
    pagination
  );

  res.json({
    success: true,
    ...paginatedResponse(results, total, pagination.page, pagination.limit),
  });
});

export const analytics = asyncHandler(async (req, res) => {
  const data = await hiringAnalyticsService.getOrgDashboard(req.organizationId);
  res.json({ success: true, data });
});

export const addNote = asyncHandler(async (req, res) => {
  const note = await collaborationService.addNote(
    req.organizationId,
    req.params.applicationId,
    req.user._id,
    req.body
  );
  res.status(201).json({ success: true, data: note });
});

export const getNotes = asyncHandler(async (req, res) => {
  const notes = await collaborationService.getNotes(req.organizationId, req.params.applicationId);
  res.json({ success: true, data: notes });
});

export const scheduleInterview = asyncHandler(async (req, res) => {
  const interview = await interviewScheduleService.schedule(
    req.organizationId,
    req.user._id,
    req.body
  );
  res.status(201).json({ success: true, data: interview });
});

export const listInterviews = asyncHandler(async (req, res) => {
  const interviews = await interviewScheduleService.list(req.organizationId, req.query);
  res.json({ success: true, data: interviews });
});

export const createPool = asyncHandler(async (req, res) => {
  const pool = await talentPoolService.create(req.organizationId, req.user._id, req.body);
  res.status(201).json({ success: true, data: pool });
});

export const listPools = asyncHandler(async (req, res) => {
  const pools = await talentPoolService.list(req.organizationId);
  res.json({ success: true, data: pools });
});

export const addToPool = asyncHandler(async (req, res) => {
  const pool = await talentPoolService.addCandidate(req.params.poolId, req.organizationId, req.body);
  res.json({ success: true, data: pool });
});

export const getTimeline = asyncHandler(async (req, res) => {
  const activities = await activityService.getByApplication(req.params.applicationId);
  res.json({ success: true, data: activities });
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { logs, total } = await auditService.list(req.organizationId, pagination);
  res.json({
    success: true,
    ...paginatedResponse(logs, total, pagination.page, pagination.limit),
  });
});
