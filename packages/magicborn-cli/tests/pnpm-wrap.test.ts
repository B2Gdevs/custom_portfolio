import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { findNearestPackageJsonRoot } from '../src/pnpm-wrap.ts';

describe('findNearestPackageJsonRoot', () => {
  it('finds the closest package.json upward', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-pnpm-'));
    const inner = path.join(tmp, 'a', 'b', 'c');
    fs.mkdirSync(inner, { recursive: true });
    fs.writeFileSync(
      path.join(tmp, 'a', 'package.json'),
      JSON.stringify({ name: 'x', private: true }),
      'utf8',
    );
    expect(findNearestPackageJsonRoot(inner)).toBe(path.join(tmp, 'a'));
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('returns null when no package.json exists', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-pnpm-empty-'));
    expect(findNearestPackageJsonRoot(tmp)).toBeNull();
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
