import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Commands that need a real TTY (nested Ink, etc.). */
const INHERIT_STDIO_FIRST = new Set(['chat']);

export function resolveMagicbornCliJs(fromImportMetaUrl: string): string {
  const dir = path.dirname(fileURLToPath(fromImportMetaUrl));
  return path.join(dir, '..', 'cli.js');
}

export type ExecReplArgvResult = {
  code: number;
  /** Captured stdout+stderr when not inherit mode */
  combined?: string;
};

/**
 * Re-invoke this package's `cli.js` with argv (same as typing `magicborn …` in the shell).
 */
export function execMagicbornCliArgv(
  cliJs: string,
  repoRoot: string,
  argv: string[],
): ExecReplArgvResult {
  if (!fs.existsSync(cliJs)) {
    return { code: 1, combined: `Missing CLI entry: ${cliJs}` };
  }

  const inherit = argv.length > 0 && INHERIT_STDIO_FIRST.has(argv[0]!);

  if (inherit) {
    if (process.stdout.isTTY && argv[0] === 'chat') {
      console.clear();
    }
    const r = spawnSync(process.execPath, [cliJs, ...argv], {
      cwd: repoRoot,
      stdio: 'inherit',
      env: { ...process.env },
    });
    return { code: r.status ?? 1 };
  }

  const r = spawnSync(process.execPath, [cliJs, ...argv], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    env: { ...process.env },
    maxBuffer: 12 * 1024 * 1024,
  });

  let combined = `${r.stdout || ''}${r.stderr || ''}`.trimEnd();
  if (combined.length > 12_000) {
    combined = `${combined.slice(0, 12_000)}\n\n… (truncated)`;
  }

  return { code: r.status ?? 1, combined };
}
