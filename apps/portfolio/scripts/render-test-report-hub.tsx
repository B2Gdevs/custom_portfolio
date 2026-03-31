/**
 * Builds test-reports/index.html from Vitest JSON + environment snapshot using
 * the same React + Tailwind stack as the app (see scripts/test-report-hub/hub-entry.css).
 *
 * Run via: pnpm exec tsx scripts/render-test-report-hub.tsx
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { renderToStaticMarkup } from 'react-dom/server';

import { TestReportHub, type TestReportHubProps } from '@/components/test-report/TestReportHub';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const unitDir = path.join(appRoot, 'test-reports', 'unit');
const vitestJson = path.join(unitDir, 'vitest-results.json');
const envJson = path.join(unitDir, 'environment.json');
const outFile = path.join(appRoot, 'test-reports', 'index.html');
const hubCssOut = path.join(appRoot, 'test-reports', 'hub.css');
const hubCssIn = path.join(appRoot, 'scripts', 'test-report-hub', 'hub-entry.css');

function readJson<T>(p: string): T | null {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as T;
  } catch {
    return null;
  }
}

function compileHubCss(): void {
  const tw = spawnSync(
    'pnpm',
    ['exec', 'tailwindcss', '-i', hubCssIn, '-o', hubCssOut, '-m'],
    { cwd: appRoot, stdio: 'inherit', shell: true },
  );
  if (tw.status !== 0) {
    process.exit(tw.status ?? 1);
  }
}

type VitestJson = {
  numTotalTests?: number;
  numPassedTests?: number;
  numFailedTests?: number;
  numPendingTests?: number;
  numPassedTestSuites?: number;
  numFailedTestSuites?: number;
  success?: boolean;
  testResults?: Array<{
    name?: string;
    status?: string;
    assertionResults?: Array<{
      status?: string;
      title?: string;
      failureMessages?: string[];
    }>;
  }>;
};

type EnvJson = {
  generatedAt?: string;
  node?: string;
  platform?: string;
  variables?: Record<string, string>;
};

function buildProps(): TestReportHubProps {
  const results = readJson<VitestJson>(vitestJson);
  const env = readJson<EnvJson>(envJson);

  const total = results?.numTotalTests ?? 0;
  const passed = results?.numPassedTests ?? 0;
  const failed = results?.numFailedTests ?? 0;
  const pending = results?.numPendingTests ?? 0;
  const suitePass = results?.numPassedTestSuites ?? 0;
  const suiteFail = results?.numFailedTestSuites ?? 0;
  const success = results?.success !== false && failed === 0;

  const passPct = total > 0 ? Math.round((passed / total) * 1000) / 10 : 0;
  const failPct = total > 0 ? Math.round((failed / total) * 1000) / 10 : 0;

  const fileRows: TestReportHubProps['fileRows'] = [];
  if (results?.testResults?.length) {
    for (const file of results.testResults) {
      const name = file.name?.replace(/\\/g, '/') ?? 'unknown';
      const short = name.includes('apps/portfolio/') ? (name.split('apps/portfolio/')[1] ?? name) : name;
      const tests = file.assertionResults ?? [];
      const f = tests.filter((t) => t.status === 'failed').length;
      const p = tests.filter((t) => t.status === 'passed').length;
      const st = file.status === 'failed' || f > 0 ? 'failed' : 'passed';
      fileRows.push({ short, st, p, f });
    }
  }

  const envRows = env?.variables
    ? Object.entries(env.variables).map(([k, v]) => ({ k, v: String(v) }))
    : [];

  const failures: TestReportHubProps['failures'] = [];
  for (const file of results?.testResults ?? []) {
    const name = file.name?.replace(/\\/g, '/') ?? 'unknown';
    const short = name.includes('apps/portfolio/') ? (name.split('apps/portfolio/')[1] ?? name) : name;
    for (const t of file.assertionResults ?? []) {
      if (t.status === 'failed' && t.failureMessages?.length) {
        failures.push({
          file: short,
          title: t.title ?? 'unknown',
          msg: t.failureMessages.join('\n'),
        });
      }
    }
  }

  return {
    builtAt: new Date().toISOString(),
    success,
    total,
    passed,
    failed,
    pending,
    suitePass,
    suiteFail,
    passPct,
    failPct,
    fileRows,
    failures,
    envRows,
    envMeta:
      env?.node || env?.platform || env?.generatedAt
        ? { node: env.node, platform: env.platform, generatedAt: env.generatedAt }
        : undefined,
  };
}

function documentShell(innerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark font-sans">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Portfolio unit tests — report hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="./hub.css" />
</head>
<body class="antialiased">
${innerHtml}
</body>
</html>
`;
}

compileHubCss();

const props = buildProps();
const inner = renderToStaticMarkup(<TestReportHub {...props} />);
const html = documentShell(inner);

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, html, 'utf8');
console.log(`[test-report-hub] wrote ${path.relative(appRoot, outFile)} (React + ${path.relative(appRoot, hubCssOut)})`);
