import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { findRepoRoot, tryResolveRepoRootFromEnv } from '../src/repo-root.js';

describe('tryResolveRepoRootFromEnv', () => {
  const prevMagicborn = process.env.MAGICBORN_REPO;
  const prevMb = process.env.MB_CLI_REPO;

  afterEach(() => {
    if (prevMagicborn === undefined) delete process.env.MAGICBORN_REPO;
    else process.env.MAGICBORN_REPO = prevMagicborn;
    if (prevMb === undefined) delete process.env.MB_CLI_REPO;
    else process.env.MB_CLI_REPO = prevMb;
  });

  it('returns null when env unset', () => {
    delete process.env.MAGICBORN_REPO;
    delete process.env.MB_CLI_REPO;
    expect(tryResolveRepoRootFromEnv()).toBeNull();
  });

  it('resolves MAGICBORN_REPO when pnpm-workspace.yaml exists', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-root-'));
    fs.writeFileSync(path.join(tmp, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"\n', 'utf8');
    process.env.MAGICBORN_REPO = tmp;
    expect(tryResolveRepoRootFromEnv()).toBe(path.resolve(tmp));
  });

  it('findRepoRoot uses env over cwd', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-root-'));
    fs.writeFileSync(path.join(tmp, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"\n', 'utf8');
    process.env.MAGICBORN_REPO = tmp;
    expect(findRepoRoot('/tmp')).toBe(path.resolve(tmp));
  });
});
