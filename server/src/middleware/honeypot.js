import { sendSuccess } from '../utils/apiResponse.js';

// A honeypot is a form field that real people never see (hidden with CSS) but bots fill in.
// If it has any value, we pretend everything worked and save nothing, so the bot learns nothing.
// Use AFTER validate(), and send the same success message the real controller would.
export const honeypot =
  (field, fakeResponse) =>
  (req, res, next) => {
    if (req.body?.[field]) {
      return sendSuccess(res, fakeResponse, { status: 201 });
    }
    next();
  };
