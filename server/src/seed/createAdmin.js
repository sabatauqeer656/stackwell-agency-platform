// Creates the first admin account. Run from the project root:  npm run seed:admin
// Reads ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD from server/.env
import mongoose from 'mongoose';
import { z } from 'zod';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

const adminSchema = z.object({
  ADMIN_NAME: z.string().trim().min(2, 'ADMIN_NAME is required'),
  ADMIN_EMAIL: z.email('ADMIN_EMAIL must be a valid email').trim().toLowerCase(),
  ADMIN_PASSWORD: z.string().min(10, 'ADMIN_PASSWORD must be at least 10 characters'),
});

const parsed = adminSchema.safeParse(env);
if (!parsed.success) {
  console.error('Cannot create admin:');
  for (const issue of parsed.error.issues) console.error(`  - ${issue.message}`);
  process.exit(1);
}
const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = parsed.data;

try {
  await connectDB();
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`An account for ${ADMIN_EMAIL} already exists. Nothing changed.`);
  } else {
    await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' });
    console.log(`Admin created: ${ADMIN_EMAIL}. You can now remove ADMIN_PASSWORD from server/.env.`);
  }
} catch (err) {
  console.error('Seeding failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
