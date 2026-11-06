import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// Load server/.env into process.env (built into Node, no dotenv package needed).
// A missing file is fine: in production the host provides real env variables.
try {
  process.loadEnvFile(fileURLToPath(new URL('../../.env', import.meta.url)));
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
}

// The "contract": every setting the server needs, and what a valid value looks like.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.url(),
  MONGO_URI: z
    .string()
    .regex(/^mongodb(\+srv)?:\/\//, 'must start with mongodb:// or mongodb+srv://'),

  // Secret used to sign access tokens. Anyone who knows it can forge logins, so it must be long.
  JWT_ACCESS_SECRET: z.string().min(32, 'must be at least 32 characters'),
  // Access tokens are short-lived on purpose (e.g. 15m, 1h). Refresh tokens come in the next step.
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),

  // Refresh tokens last days, live in an httpOnly cookie, and use a DIFFERENT secret.
  JWT_REFRESH_SECRET: z.string().min(32, 'must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().int().positive().default(7),

  // Cloudinary stores uploaded files (quote attachments now, team and project images later).
  // The API secret lets anyone upload and delete files in your account, so it is never committed.
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'is required (Cloudinary dashboard)'),
  CLOUDINARY_API_KEY: z.string().min(1, 'is required (Cloudinary dashboard)'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'is required (Cloudinary dashboard)'),

  // Email (all optional). Without them the server still works: emails are written to the log
  // instead of being sent. Fill in SMTP_HOST, SMTP_USER, SMTP_PASS and MAIL_FROM to send for real.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(465), // 465 = SSL, 587 = STARTTLS
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional(), // e.g. "Stackwell <you@gmail.com>"
  MAIL_TO: z.string().optional(), // the inbox that receives "new message / new quote" alerts

  // Only read by `npm run seed:admin` to create the first admin account
  ADMIN_NAME: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
}).superRefine((values, context) => {
  // Half-filled email settings are almost always a mistake: say so at startup instead of failing at the first email
  const smtp = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];
  if (smtp.some((key) => values[key]) && !smtp.every((key) => values[key])) {
    for (const key of smtp.filter((name) => !values[name])) {
      context.addIssue({ code: 'custom', path: [key], message: 'is required when any other email setting is set' });
    }
  }
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment configuration:');
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

// The rest of the app imports this validated, correctly-typed object.
export const env = result.data;
