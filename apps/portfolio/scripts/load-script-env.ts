import path from 'node:path';
import { createRequire } from 'node:module';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';

let envLoaded = false;

export function loadScriptEnv() {
  if (envLoaded) {
    return;
  }

  const require = createRequire(import.meta.url);
  const nextEnvModule = require('@next/env');
  const loadEnvConfig =
    nextEnvModule.loadEnvConfig ??
    nextEnvModule.default?.loadEnvConfig ??
    nextEnvModule.default;

  if (typeof loadEnvConfig !== 'function') {
    throw new Error('could not load @next/env loadEnvConfig');
  }

  const appRoot = resolvePortfolioAppRoot();
  const repoRoot = path.resolve(appRoot, '..', '..');

  loadEnvConfig(repoRoot);
  if (appRoot !== repoRoot) {
    loadEnvConfig(appRoot);
  }

  envLoaded = true;
}
