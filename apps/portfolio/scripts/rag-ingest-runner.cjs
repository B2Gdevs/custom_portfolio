const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { build } = require('esbuild');

let pc;
try {
  pc = require('picocolors');
} catch {
  pc = {
    dim: (s) => s,
    green: (s) => s,
    red: (s) => s,
    bold: (s) => s,
  };
}

function resolvePortfolioAppRoot() {
  const fromEnv = process.env.PORTFOLIO_APP_ROOT?.trim();
  if (fromEnv) {
    const resolved = path.resolve(fromEnv);
    if (fs.existsSync(path.join(resolved, 'package.json'))) {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(resolved, 'package.json'), 'utf8'));
        if (pkg.name === '@portfolio/app') {
          return resolved;
        }
      } catch {
        /* ignore */
      }
    }
  }

  let dir = process.cwd();
  for (let depth = 0; depth < 10; depth += 1) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.name === '@portfolio/app') {
          return dir;
        }
      } catch {
        /* ignore */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  const nested = path.join(process.cwd(), 'apps', 'portfolio');
  if (fs.existsSync(path.join(nested, 'package.json'))) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(nested, 'package.json'), 'utf8'));
      if (pkg.name === '@portfolio/app') {
        return path.resolve(nested);
      }
    } catch {
      /* ignore */
    }
  }

  throw new Error(
    '[rag-ingest] Could not resolve apps/portfolio. Run `pnpm rag:ingest` from the repo root, cd to apps/portfolio, or set PORTFOLIO_APP_ROOT to that directory.',
  );
}

function loadDotEnv(appRoot) {
  const envFiles = [
    path.join(appRoot, '.env.local'),
    path.join(appRoot, '.env'),
    path.join(appRoot, '..', '..', '.env.local'),
    path.join(appRoot, '..', '..', '.env'),
  ];

  for (const envFile of envFiles) {
    if (!fs.existsSync(envFile)) {
      continue;
    }

    const contents = fs.readFileSync(envFile, 'utf8');
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^(?!\s*#)([^=]+)=(.*)$/);
      if (!match) {
        continue;
      }

      const key = match[1].trim();
      if (!key || process.env[key]) {
        continue;
      }

      let value = match[2] ?? '';
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  }
}

async function main() {
  const appRoot = resolvePortfolioAppRoot();
  process.chdir(appRoot);
  loadDotEnv(appRoot);

  const dim = (s) => (process.stdout.isTTY ? pc.dim(s) : s);
  const green = (s) => (process.stdout.isTTY ? pc.green(s) : s);
  const red = (s) => (process.stdout.isTTY ? pc.red(s) : s);
  const bold = (s) => (process.stdout.isTTY ? pc.bold(s) : s);

  console.log('');
  console.log(bold('@portfolio/app') + dim('  bundle ingest script'));
  console.log(dim(`  ${appRoot}`));
  console.log('');

  const tempParent = path.join(appRoot, '.tmp');
  fs.mkdirSync(tempParent, { recursive: true });
  const tempDir = fs.mkdtempSync(path.join(tempParent, 'portfolio-rag-'));
  const outfile = path.join(tempDir, 'rag-ingest.mjs');

  let exitCode = 1;

  try {
    const tBuild = Date.now();
    console.log(dim('  › esbuild bundle → .tmp/…/rag-ingest.mjs'));
    await build({
      entryPoints: [path.join(appRoot, 'scripts', 'rag-ingest-entry.ts')],
      outfile,
      bundle: true,
      format: 'esm',
      platform: 'node',
      target: 'node20',
      packages: 'external',
      tsconfig: path.join(appRoot, 'tsconfig.json'),
      logLevel: 'silent',
      banner: {
        js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
      },
    });
    const buildMs = Date.now() - tBuild;
    console.log(`  ${green('✓')} bundle ready in ${buildMs}ms`);
    console.log(dim('  › node rag-ingest.mjs (see steps below)'));
    console.log('');

    const result = spawnSync(process.execPath, [outfile], {
      cwd: appRoot,
      env: { ...process.env, PORTFOLIO_APP_ROOT: appRoot },
      stdio: 'inherit',
    });

    if (result.error) {
      throw result.error;
    }

    exitCode = typeof result.status === 'number' ? result.status : 1;

    if (exitCode !== 0) {
      console.log(`\n  ${red('✖')} ingest process exited with code ${exitCode}`);
    }
  } finally {
    try {
      fs.rmSync(tempDir, { force: true, recursive: true });
    } catch {
      /* ignore */
    }
  }

  return exitCode;
}

main()
  .then((code) => {
    process.exit(typeof code === 'number' ? code : 1);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
