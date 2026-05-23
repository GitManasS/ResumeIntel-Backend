import jdMatchService from '../services/jdMatch.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

export const createMatch = asyncHandler(async (req, res) => {
  const match = await jdMatchService.createMatch(req.user._id, req.body);
  res.status(201).json({ success: true, data: match });
});

export const getMatches = asyncHandler(async (req, res) => {
  const pagination = getPagination(req.query);
  const { matches, total } = await jdMatchService.getHistory(req.user._id, pagination);
  res.json({
    success: true,
    ...paginatedResponse(matches, total, pagination.page, pagination.limit),
  });
});

export const getMatch = asyncHandler(async (req, res) => {
  const match = await jdMatchService.getById(req.params.id, req.user._id);
  res.json({ success: true, data: match });
});
