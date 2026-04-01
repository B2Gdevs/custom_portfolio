import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadScriptEnv } from './load-script-env';
import {
  exportLocalProviderSnapshot,
  getHostedBootstrapCommands,
  getProviderBootstrapStatus,
  importLocalProviderSnapshot,
} from '@/lib/payload/provider-bootstrap';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';

function resolvePathArg(value: string | undefined, fallbackName: string) {
  const appRoot = resolvePortfolioAppRoot();
  const provided = value?.trim();
  if (!provided) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return path.join(appRoot, '.provider-snapshots', `${fallbackName}-${timestamp}`);
  }

  return path.isAbsolute(provided) ? provided : path.resolve(process.cwd(), provided);
}

function runHostedBootstrap() {
  const appRoot = resolvePortfolioAppRoot();
  const commands = getHostedBootstrapCommands();

  for (const step of commands) {
    console.log(`[provider-bootstrap] ${step.label}`);
    const env = {
      ...process.env,
      ...step.env,
    };

    try {
      if (process.platform === 'win32' && step.command === 'pnpm') {
        execFileSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', ['pnpm', ...step.args].join(' ')], {
          cwd: appRoot,
          env,
          stdio: 'inherit',
        });
        continue;
      }

      execFileSync(step.command, step.args, {
        cwd: appRoot,
        env,
        stdio: 'inherit',
      });
    } catch (error) {
      if (!step.optional) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[provider-bootstrap] optional step failed: ${step.label}`);
      console.warn(`[provider-bootstrap] ${message}`);
    }
  }
}

async function main() {
  loadScriptEnv();

  const [command, value] = process.argv.slice(2);

  switch (command) {
    case 'status': {
      console.log(`${JSON.stringify(getProviderBootstrapStatus(), null, 2)}\n`);
      return;
    }
    case 'export-local': {
      const outputDir = resolvePathArg(value, 'local-runtime');
      const result = exportLocalProviderSnapshot(outputDir);
      console.log(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }
    case 'import-local': {
      if (!value) {
        throw new Error('provider-bootstrap import-local requires a snapshot directory path.');
      }

      const inputDir = resolvePathArg(value, 'local-runtime');
      const result = importLocalProviderSnapshot(inputDir);
      console.log(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }
    case 'bootstrap-hosted': {
      runHostedBootstrap();
      return;
    }
    default: {
      console.log(
        [
          'Usage: tsx scripts/provider-bootstrap.ts <command> [path]',
          '  status',
          '  export-local [output-dir]',
          '  import-local <snapshot-dir>',
          '  bootstrap-hosted',
        ].join('\n'),
      );
    }
  }
}

main().catch((error) => {
  console.error('[provider-bootstrap] failed:', error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
