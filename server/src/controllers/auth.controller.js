import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { loginUser } from '../services/auth.service.js';

// Controllers stay thin: read the request, call a service, send the response.
export const login = asyncHandler(async (req, res) => {
  const { user, accessToken } = await loginUser(req.body);
  sendSuccess(res, { user, accessToken });
});
