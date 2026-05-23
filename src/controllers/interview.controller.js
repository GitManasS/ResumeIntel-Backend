import interviewService from '../services/interview.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

export const generateQuestions = asyncHandler(async (req, res) => {
  const set = await interviewService.generate(req.user._id, req.body);
  res.status(201).json({ success: true, data: set });
});

export const getQuestionSets = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { sets, total } = await interviewService.getHistory(req.user._id, pagination);
  res.json({
    success: true,
    ...paginatedResponse(sets, total, pagination.page, pagination.limit),
  });
});

export const getQuestionSet = asyncHandler(async (req, res) => {
  const set = await interviewService.getById(req.params.id, req.user._id);
  res.json({ success: true, data: set });
});
