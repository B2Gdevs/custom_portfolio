/**
 * Full picture: which .env files exist, their contents, then the entire merged
 * process.env after the same loadEnvConfig as Next (repo root + apps/portfolio).
 *
 * WARNING: prints real secret values to your terminal. Do not run in CI or pipe to logs.
 *
 * Run: pnpm chat:env-preview
 */
import fs from 'node:fs';
import path from 'node:path';

import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';

import { loadScriptEnv } from './load-script-env';

function formatProcessEnvValue(raw: string | undefined): string {
  if (raw === undefined) {
    return '(unset in process.env)';
  }
  if (raw === '') {
    return '(empty string)';
  }
  return raw;
}

const ENV_FILES = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local',
  '.env.production',
  '.env.production.local',
] as const;

function printFileIfExists(label: string, filePath: string): void {
  if (!fs.existsSync(filePath)) {
    console.log(`\n[${label}] (missing) ${filePath}`);
    return;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  console.log(`\n[${label}] ${filePath}`);
  console.log('─'.repeat(72));
  for (const line of lines) {
    console.log(line.trimEnd());
  }
}

const appRoot = resolvePortfolioAppRoot();
const repoRoot = path.resolve(appRoot, '..', '..');

console.log(
  'WARNING: full secret values are printed below. Same load order as Next: loadEnvConfig(repoRoot), then loadEnvConfig(appRoot).',
);
console.log(`repoRoot=${repoRoot}`);
console.log(`appRoot=${appRoot}`);
console.log(`NODE_ENV=${process.env.NODE_ENV ?? '(unset)'}`);
console.log('─'.repeat(72));
console.log('\n### On-disk .env files (raw; comments preserved)');

for (const name of ENV_FILES) {
  printFileIfExists(`repo ${name}`, path.join(repoRoot, name));
}
for (const name of ENV_FILES) {
  printFileIfExists(`app ${name}`, path.join(appRoot, name));
}

loadScriptEnv();

console.log('\n### After loadEnvConfig — full process.env (sorted, raw values)');
console.log('─'.repeat(72));

const keys = Object.keys(process.env).sort();
for (const key of keys) {
  console.log(`${key}=${formatProcessEnvValue(process.env[key])}`);
}

console.log('\n### Quick checks (chat / layout)');
const k = process.env.OPENAI_API_KEY;
const openaiPresent = Boolean(k?.trim());
console.log(
  `OPENAI_API_KEY in merged env: ${openaiPresent ? `YES (length ${k!.length} chars)` : 'NO — chat API returns 503 and copilot shell stays off'}`,
);
console.log(`NEXT_PUBLIC_SITE_CHAT=${formatProcessEnvValue(process.env.NEXT_PUBLIC_SITE_CHAT)}`);
console.log('');
