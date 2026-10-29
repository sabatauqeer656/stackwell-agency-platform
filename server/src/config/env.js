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
