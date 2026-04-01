import { spawnSync } from 'node:child_process';

function runStep(cwd: string, label: string, command: string, args: string[]): number {
  console.error(`\n→ ${label}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });
  return result.status ?? 1;
}

/**
 * Refresh workspace deps and rebuild packages the CLI depends on (same as after `git pull`).
 */
export function runMagicbornUpdate(repoRoot: string, opts: { pull?: boolean }): number {
  if (opts.pull) {
    const code = runStep(repoRoot, 'git pull --ff-only', 'git', ['pull', '--ff-only']);
    if (code !== 0) {
      return code;
    }
  }

  const steps: Array<[string, string, string[]]> = [
    ['pnpm install (workspace)', 'pnpm', ['install']],
    ['Rebuild @magicborn/cli', 'pnpm', ['--filter', '@magicborn/cli', 'run', 'build']],
    ['Rebuild @portfolio/repub-builder', 'pnpm', ['--filter', '@portfolio/repub-builder', 'run', 'build']],
  ];

  for (const [label, cmd, args] of steps) {
    const code = runStep(repoRoot, label, cmd, args);
    if (code !== 0) {
      return code;
    }
  }

  console.error(
    '\nDone. Dependencies and local package builds are fresh. Run `magicborn --help` (you may need a new shell if PATH changed).',
  );
  return 0;
}
