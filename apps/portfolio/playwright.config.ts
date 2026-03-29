import { defineConfig } from '@playwright/test';

const port = 3101;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `pnpm build && pnpm exec next start --port ${port} --hostname 127.0.0.1`,
    cwd: __dirname,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 600_000,
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
