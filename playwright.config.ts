import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);

/**
 * E2E tests run against a production build in "local demo mode" (no Supabase env),
 * so they are deterministic and need no backend. Run: npm run test:e2e
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    locale: 'it-IT',
    timezoneId: 'Europe/Rome',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 } },
      testIgnore: /responsive\.spec\.ts/,
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /responsive\.spec\.ts/ },
  ],
  webServer: [
    {
      // Fake eBay / Etsy APIs so the live-marketplace flow is tested without real keys.
      command: 'node tests/e2e/fake-market-server.mjs',
      url: 'http://localhost:3199/health',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run build && npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
        AI_API_KEY: '',
        EBAY_CLIENT_ID: 'e2e-client',
        EBAY_CLIENT_SECRET: 'e2e-secret',
        EBAY_API_BASE: 'http://localhost:3199',
        ETSY_API_KEY: 'e2e:secret',
        ETSY_API_BASE: 'http://localhost:3199',
        MARKET_RATE_LIMIT_PER_MINUTE: '100',
      },
    },
  ],
});
