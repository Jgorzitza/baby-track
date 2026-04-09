import { defineConfig, devices } from '@playwright/test';

const port = 4174;
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    ...devices['iPhone 13'],
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
        port,
        timeout: 60_000,
        reuseExistingServer: !process.env.CI,
      },
});
