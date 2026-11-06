import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getDashboardStats } from '../services/stats.service.js';

export const dashboardStats = asyncHandler(async (req, res) => {
  sendSuccess(res, await getDashboardStats());
});
