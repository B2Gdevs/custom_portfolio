import path from 'node:path';
import { spawn } from 'node:child_process';

type SiteAppsWorkerResult = {
  status: number;
  body: unknown;
};

function resolveTsxCliPath() {
  return path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
}

function resolveWorkerPath() {
  return path.join(process.cwd(), 'scripts', 'site-apps-worker.ts');
}

export async function runSiteAppsWorker(): Promise<SiteAppsWorkerResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [resolveTsxCliPath(), resolveWorkerPath()], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `site apps worker exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout) as SiteAppsWorkerResult);
      } catch (error) {
        reject(
          new Error(
            `site apps worker returned invalid JSON: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
        );
      }
    });
  });
}
