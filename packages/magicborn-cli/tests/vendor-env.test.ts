import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadVendorDotEnv } from '../src/vendor-env.ts';

describe('loadVendorDotEnv', () => {
  let tmp: string;

  afterEach(() => {
    if (tmp && fs.existsSync(tmp)) {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('returns empty when no .env', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-vendor-'));
    expect(loadVendorDotEnv(tmp)).toEqual({});
  });

  it('parses KEY=value and strips quotes', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-vendor-'));
    fs.writeFileSync(
      path.join(tmp, '.env'),
      ['# c', 'FOO=bar', 'BAZ="q u x"', "QUX='single'", ''].join('\n'),
      'utf8',
    );
    expect(loadVendorDotEnv(tmp)).toEqual({
      FOO: 'bar',
      BAZ: 'q u x',
      QUX: 'single',
    });
  });
});
