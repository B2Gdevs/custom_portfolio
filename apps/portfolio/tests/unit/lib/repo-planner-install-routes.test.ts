import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../..');
const scriptPath = path.join(repoRoot, 'vendor/repo-planner/scripts/install-routes.mjs');

describe('install-routes.mjs', () => {
  it('targets package exports and skips write routes by default', () => {
    const output = execFileSync(
      process.execPath,
      [scriptPath, '--app-dir=apps/portfolio', '--dry-run'],
      { cwd: repoRoot, encoding: 'utf-8' },
    );

    expect(output).toContain('apps\\portfolio\\app\\api\\planning-state\\route.ts');
    expect(output).toContain('from "repo-planner/api/planning-state/route";');
    expect(output).not.toContain('planning-edits/apply');
    expect(output).not.toContain('planning-cli/run');
  });

  it('includes gated write routes only when explicitly requested', () => {
    const output = execFileSync(
      process.execPath,
      [scriptPath, '--app-dir=apps/portfolio', '--dry-run', '--include-cli-run', '--include-edits-apply'],
      { cwd: repoRoot, encoding: 'utf-8' },
    );

    expect(output).toContain('from "repo-planner/api/planning-cli/run/route";');
    expect(output).toContain('from "repo-planner/api/planning-edits/apply/route";');
  });
});
