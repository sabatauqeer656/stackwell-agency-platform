import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// The token carries only what the server needs to recognise the user: id and role.
// Never put passwords or personal data in a JWT: it is signed, NOT encrypted.
export const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
