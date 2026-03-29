const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { build } = require('esbuild');

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
  const appRoot = process.cwd();
  loadDotEnv(appRoot);
  console.log(`[rag-runner ${new Date().toISOString()}] starting`, {
    appRoot,
  });

  const tempParent = path.join(appRoot, '.tmp');
  fs.mkdirSync(tempParent, { recursive: true });
  const tempDir = fs.mkdtempSync(path.join(tempParent, 'portfolio-rag-'));
  const outfile = path.join(tempDir, 'rag-ingest.mjs');

  try {
    console.log(`[rag-runner ${new Date().toISOString()}] bundling entry`, {
      entry: path.join(appRoot, 'scripts', 'rag-ingest-entry.ts'),
    });
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
    console.log(`[rag-runner ${new Date().toISOString()}] bundle ready`, {
      outfile,
    });

    const result = spawnSync(process.execPath, [outfile], {
      cwd: appRoot,
      env: process.env,
      stdio: 'inherit',
    });
    console.log(`[rag-runner ${new Date().toISOString()}] child process finished`, {
      status: result.status ?? null,
      signal: result.signal ?? null,
    });

    if (typeof result.status === 'number' && result.status !== 0) {
      process.exitCode = result.status;
    } else if (result.error) {
      throw result.error;
    }
  } finally {
    fs.rmSync(tempDir, { force: true, recursive: true });
    console.log(`[rag-runner ${new Date().toISOString()}] cleaned temp bundle`, {
      tempDir,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
