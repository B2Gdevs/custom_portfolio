/**
 * npm/RAG-ingest-style stderr diagnostics for `magicborn chat`.
 */
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';

function shouldUseColor(): boolean {
  return Boolean(process.stderr.isTTY) && process.env.NO_COLOR == null;
}

function c(enabled: boolean, fn: (s: string) => string, s: string): string {
  return enabled ? fn(s) : s;
}

function formatMs(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

function rssLine(): string {
  const { rss, heapUsed, heapTotal } = process.memoryUsage();
  const kb = (n: number) => (n / 1024).toFixed(0);
  return `rss ${kb(rss)} KiB · heap ${kb(heapUsed)} / ${kb(heapTotal)} KiB`;
}

function redactDatabaseUrl(raw: string | undefined): string {
  if (!raw?.trim()) {
    return '(not set)';
  }
  try {
    const u = new URL(raw);
    if (u.password) {
      u.password = '***';
    }
    return u.toString();
  } catch {
    return '(unparseable URL)';
  }
}

function readPortfolioVersion(portfolioRoot: string): string {
  try {
    const pkgPath = path.join(portfolioRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export function readChatBuildIdSnippet(appDir: string, distDir: string): string | undefined {
  try {
    const p = path.join(appDir, distDir, 'BUILD_ID');
    const id = fs.readFileSync(p, 'utf8').trim();
    return id.length > 12 ? `${id.slice(0, 12)}…` : id;
  } catch {
    return undefined;
  }
}

export type ChatCliBannerMode = 'production' | 'dev' | 'ink-only';

export function printChatCliBanner(params: {
  mode: ChatCliBannerMode;
  repoRoot: string;
  portfolioRoot: string;
}): void {
  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const bold = (s: string) => c(color, pc.bold, s);
  const cyn = (s: string) => c(color, pc.cyan, s);

  const ver = readPortfolioVersion(params.portfolioRoot);
  const subtitle =
    params.mode === 'production'
      ? 'chat · production (.next-chat + next start)'
      : params.mode === 'dev'
        ? 'chat · next dev (webpack)'
        : 'chat · Ink only (no local server)';

  console.error('');
  console.error(bold('@portfolio/app') + dim(`@${ver}`) + dim('  ') + cyn(subtitle));
  console.error(dim(`  repo   ${params.repoRoot}`));
  console.error(dim(`  app    ${params.portfolioRoot}`));
  console.error(dim(`  ${rssLine()}`));
  console.error('');
}

export function printChatCliConfigSnapshot(params: {
  port: number;
  targetChatUrl: string;
  distDir: string;
  distAbs: string;
  hadBuild: boolean;
  willRebuild: boolean;
  openaiConfigured: boolean;
}): void {
  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const grn = (s: string) => c(color, pc.green, s);
  const cyn = (s: string) => c(color, pc.cyan, s);
  const yel = (s: string) => c(color, pc.yellow, s);

  console.error(dim('── configuration ' + '─'.repeat(44)));
  console.error(`  ${dim('listen')}  127.0.0.1:${params.port}`);
  console.error(`  ${dim('POST')}    ${cyn(params.targetChatUrl)}`);
  console.error(`  ${dim('dist')}    ${params.distDir} ${dim('→')} ${params.distAbs}`);
  console.error(
    `  ${dim('build')}   ${params.hadBuild ? grn('present') : yel('missing — will run chat:build')} ${params.willRebuild ? yel('(forced rebuild)') : ''}`,
  );
  console.error(
    `  ${dim('OPENAI')}  ${params.openaiConfigured ? grn('OPENAI_API_KEY set') : yel('OPENAI_API_KEY not set (chat route may fail)')}`,
  );
  console.error(`  ${dim('DATABASE')} ${dim(redactDatabaseUrl(process.env.DATABASE_URL))}`);
  console.error(dim('──'.repeat(32)));
  console.error('');
}

export function printChatCliStep(index: number, label: string, detail?: string): void {
  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const tail = detail ? dim(` ${detail}`) : '';
  console.error(`${dim(`[${index}]`)} ${label}${tail}`);
}

export function printChatCliStepDone(label: string, ms?: number): void {
  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const grn = (s: string) => c(color, pc.green, s);
  const timing = ms !== undefined ? dim(` · ${formatMs(ms)}`) : '';
  console.error(`  ${grn('✓')} ${label}${timing}`);
}

export function printChatCliConfigSnapshotDev(params: { port: number; targetChatUrl: string }): void {
  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const cyn = (s: string) => c(color, pc.cyan, s);
  console.error(dim('── configuration ' + '─'.repeat(44)));
  console.error(`  ${dim('mode')}    next dev · webpack · HMR`);
  console.error(`  ${dim('listen')}  127.0.0.1:${params.port}`);
  console.error(`  ${dim('POST')}    ${cyn(params.targetChatUrl)}`);
  console.error(`  ${dim('DATABASE')} ${dim(redactDatabaseUrl(process.env.DATABASE_URL))}`);
  console.error(dim('──'.repeat(32)));
  console.error('');
}

export function printChatCliConfigInkOnly(params: { chatApiUrl: string }): void {
  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const cyn = (s: string) => c(color, pc.cyan, s);
  console.error(dim('── configuration ' + '─'.repeat(44)));
  console.error(`  ${dim('mode')}    no local server (--no-server)`);
  console.error(`  ${dim('POST')}    ${cyn(params.chatApiUrl)}`);
  console.error(dim('──'.repeat(32)));
  console.error('');
}

export function printChatCliReady(params: { chatApiUrl: string; buildId?: string; totalPrepMs: number }): void {
  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const grn = (s: string) => c(color, pc.green, s);
  const cyn = (s: string) => c(color, pc.cyan, s);
  console.error(dim('──'.repeat(32)));
  console.error(
    `${grn('✓')} ${cyn('ready')} ${dim('→')} ${params.chatApiUrl} ${dim(`· prep ${formatMs(params.totalPrepMs)}`)}`,
  );
  if (params.buildId) {
    console.error(dim(`  BUILD_ID ${params.buildId}`));
  }
  console.error(dim('  Opening Ink (q/Esc/Ctrl+C quits server when this session ends).'));
  console.error('');
}
