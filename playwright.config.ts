import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests: `npm run test:e2e`.
 * Builds the app, serves it with `vite preview`, and drives it in Chromium.
 * Test videos are generated with ffmpeg on first run (see tests/e2e/global-setup.ts).
 */
export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
