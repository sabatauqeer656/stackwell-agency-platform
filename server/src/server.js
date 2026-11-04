import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

try {
  await connectDB();
} catch (err) {
  // Print the reason only - never the URI, it contains the password.
  console.error(`MongoDB connection failed: ${err.message}`);
  process.exit(1);
}

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});
