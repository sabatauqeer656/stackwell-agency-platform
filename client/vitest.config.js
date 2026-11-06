import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Test settings, kept apart from vite.config.js so the production build is untouched.
// Tests run in jsdom (a simulated browser inside Node), so React components can be rendered and clicked.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    css: false, // styles are not what these tests check
  },
});
