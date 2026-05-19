import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';
const skipWebServer = process.env.E2E_SKIP_WEBSERVER === '1';
const localChromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const localEdgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const executablePath = process.env.E2E_BROWSER_PATH
  || (fs.existsSync(localChromePath) ? localChromePath : undefined)
  || (fs.existsSync(localEdgePath) ? localEdgePath : undefined);

export default defineConfig({
  testDir: './e2e',
  timeout: 180000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    locale: 'en-US',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.E2E_VIDEO === '1' ? 'retain-on-failure' : 'off',
    geolocation: { latitude: 59.377, longitude: 28.186 },
    permissions: ['geolocation']
  },
  webServer: skipWebServer ? undefined : [
    {
      command: 'npm start --prefix ../backend',
      url: 'http://127.0.0.1:3001/api/services',
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: 'npm run dev -- --host 127.0.0.1',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    }
  ],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: executablePath ? { executablePath } : {}
      }
    }
  ]
});
