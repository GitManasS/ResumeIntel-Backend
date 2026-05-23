import analyticsService from '../services/analytics.service.js';
import platformAnalyticsService from '../services/platformAnalytics.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCandidateAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getCandidateAnalytics(req.user._id);
  res.json({ success: true, data });
});

export const getRecruiterAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getRecruiterAnalytics(req.user._id);
  res.json({ success: true, data });
});

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const data = await platformAnalyticsService.getPlatformDashboard();
  res.json({ success: true, data });
});
