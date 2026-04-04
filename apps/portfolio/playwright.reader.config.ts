import { defineConfig } from '@playwright/test';

/**
 * Reader smoke tests against `next dev` (no production build). Main e2e uses `pnpm build` +
 * `next start`; this config avoids long builds and docs prerender failures during local verify.
 *
 * Usage (from apps/portfolio):
 *   pnpm exec playwright test -c playwright.reader.config.ts
 */
const port = 3102;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'reader.spec.ts',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `pnpm exec next dev --webpack --port ${port} --hostname 127.0.0.1`,
    cwd: __dirname,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      ...process.env,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'test-openai-key',
      NEXT_PUBLIC_SITE_CHAT: process.env.NEXT_PUBLIC_SITE_CHAT || '1',
      ADMIN_BASIC_AUTH_USER: process.env.ADMIN_BASIC_AUTH_USER || 'admin',
      ADMIN_BASIC_AUTH_PASSWORD: process.env.ADMIN_BASIC_AUTH_PASSWORD || 'secret',
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'test-payload-secret',
    },
  },
});
