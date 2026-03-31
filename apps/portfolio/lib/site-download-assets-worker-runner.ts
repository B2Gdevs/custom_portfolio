import path from 'node:path';
import { spawn } from 'node:child_process';
import type { FindSiteDownloadAssetsInput } from '@/lib/site-download-assets';

type SiteDownloadAssetsWorkerResult = {
  status: number;
  body: unknown;
};

const SITE_DOWNLOAD_ASSETS_WORKER_TIMEOUT_MS = 3000;

function resolveTsxCliPath() {
  return path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
}

function resolveWorkerPath() {
  return path.join(process.cwd(), 'scripts', 'site-download-assets-worker.ts');
}

export async function runSiteDownloadAssetsWorker(
  filters: FindSiteDownloadAssetsInput,
): Promise<SiteDownloadAssetsWorkerResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [resolveTsxCliPath(), resolveWorkerPath(), JSON.stringify(filters)],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    let stdout = '';
    let stderr = '';
    let settled = false;

    const cleanup = () => {
      clearTimeout(timeoutHandle);
    };

    const fail = (error: Error) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      reject(error);
    };

    const succeed = (result: SiteDownloadAssetsWorkerResult) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(result);
    };

    const timeoutHandle = setTimeout(() => {
      child.kill();
      fail(
        new Error(
          `site download assets worker timed out after ${SITE_DOWNLOAD_ASSETS_WORKER_TIMEOUT_MS}ms`,
        ),
      );
    }, SITE_DOWNLOAD_ASSETS_WORKER_TIMEOUT_MS);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      fail(error);
    });

    child.on('close', (code) => {
      if (settled) {
        return;
      }

      if (code !== 0) {
        fail(new Error(stderr || `site download assets worker exited with code ${code}`));
        return;
      }

      try {
        succeed(JSON.parse(stdout) as SiteDownloadAssetsWorkerResult);
      } catch (error) {
        fail(
          new Error(
            `site download assets worker returned invalid JSON: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
        );
      }
    });
  });
}
