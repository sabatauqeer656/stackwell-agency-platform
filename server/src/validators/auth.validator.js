import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    // Trim BEFORE checking the format: an address pasted with a trailing space is still a valid address
    email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email')),
    // No length rule here on purpose: login should not reveal the password policy
    password: z.string().min(1, 'Password is required'),
  }),
});
