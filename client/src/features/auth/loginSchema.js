import { z } from 'zod';

// Deliberately lenient on the password: the login form must not reveal (or enforce) the password rules,
// it only checks that something was typed. The server decides whether it is right.
export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Please enter your email').pipe(z.email('Enter a valid email address')),
  password: z.string().min(1, 'Please enter your password'),
});
