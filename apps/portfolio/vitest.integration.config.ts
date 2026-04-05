import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@magicborn/cli/vendor-registry': path.resolve(
        __dirname,
        '../../packages/magicborn-cli/src/vendor-registry.ts',
      ),
      '@/vendor/repo-planner': path.resolve(__dirname, '../../vendor/repo-planner'),
      '@': path.resolve(__dirname, '.'),
      '@payload-config': path.resolve(__dirname, './payload.config.ts'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/integration/**/*.integration.test.ts'],
    setupFiles: ['./tests/integration/setup.ts'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    reporters: ['default'],
  },
});
