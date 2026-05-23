import resumeService from '../services/resume.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Resume file required');
  const resume = await resumeService.upload(req.user._id, req.file);
  res.status(201).json({ success: true, data: resume });
});

export const getResumes = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { resumes, total } = await resumeService.getByUser(req.user._id, pagination);
  res.json({
    success: true,
    ...paginatedResponse(resumes, total, pagination.page, pagination.limit),
  });
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getById(req.params.id, req.user._id);
  res.json({ success: true, data: resume });
});

export const deleteResume = asyncHandler(async (req, res) => {
  await resumeService.delete(req.params.id, req.user._id);
  res.json({ success: true, message: 'Resume deleted' });
});

export const setPrimary = asyncHandler(async (req, res) => {
  const resume = await resumeService.setPrimary(req.params.id, req.user._id);
  res.json({ success: true, data: resume });
});

export const reanalyze = asyncHandler(async (req, res) => {
  const resume = await resumeService.reanalyze(
    req.params.id,
    req.user._id,
    req.body.targetRole
  );
  res.json({ success: true, data: resume });
});
