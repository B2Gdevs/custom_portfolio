import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@/vendor/repo-planner': path.resolve(__dirname, '../../vendor/repo-planner'),
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    setupFiles: ['./tests/unit/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
    reporters: [
      'default',
      ['json', { outputFile: './test-reports/unit/vitest-results.json' }],
      './tests/unit/reporters/env-summary-reporter.mjs',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['app/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/tests/**',
        '**/*.d.ts',
        '**/e2e/**',
        '.next/**',
        'coverage/**',
        '**/postcss.config.*',
        '**/next.config.*',
        '**/tailwind.config.*',
        '**/eslint.config.*',
        '**/vitest.config.*',
      ],
    },
  },
});
