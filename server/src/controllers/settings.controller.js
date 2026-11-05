import SiteSettings from '../models/SiteSettings.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

// Find the one settings document, or create it with the defaults if it does not exist yet.
// A single atomic upsert (instead of "find, then create") is safe even if two requests
// arrive at the same moment on a fresh database.
const loadSettings = (changes = {}) =>
  SiteSettings.findOneAndUpdate({ key: 'main' }, { $set: changes }, {
    upsert: true,
    returnDocument: 'after',
    setDefaultsOnInsert: true,
    runValidators: true,
  });

export const getSettings = asyncHandler(async (req, res) => {
  sendSuccess(res, await loadSettings());
});

export const updateSettings = asyncHandler(async (req, res) => {
  sendSuccess(res, await loadSettings(req.body));
});
