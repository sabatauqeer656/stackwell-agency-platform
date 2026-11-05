import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.email('Enter a valid email').trim().toLowerCase(),
    // No length rule here on purpose: login should not reveal the password policy
    password: z.string().min(1, 'Password is required'),
  }),
});
