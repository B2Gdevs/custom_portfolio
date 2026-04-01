/**
 * Run RAG ingest scoped to @portfolio/app from the monorepo root.
 * Usage (from repo root): pnpm rag:ingest
 */
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const portfolioAppRoot = path.join(repoRoot, 'apps', 'portfolio');
const runner = path.join(portfolioAppRoot, 'scripts', 'rag-ingest-runner.cjs');

const result = spawnSync(process.execPath, [runner], {
  cwd: portfolioAppRoot,
  env: {
    ...process.env,
    PORTFOLIO_APP_ROOT: portfolioAppRoot,
  },
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(typeof result.status === 'number' ? result.status : 1);
