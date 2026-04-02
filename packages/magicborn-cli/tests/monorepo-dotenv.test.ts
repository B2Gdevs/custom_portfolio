import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { applyMonorepoRootEnvToProcess, parseEnvFile } from '../src/lib/monorepo-dotenv.js';

describe('parseEnvFile', () => {
  let tmp: string;
  afterEach(() => {
    if (tmp && fs.existsSync(tmp)) {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('parses KEY=value and quoted values', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-env-'));
    const f = path.join(tmp, '.env');
    fs.writeFileSync(f, 'FOO=bar\nexport BAZ="q u x"\n#c\nEMPTY=\n', 'utf8');
    const o = parseEnvFile(f);
    expect(o.FOO).toBe('bar');
    expect(o.BAZ).toBe('q u x');
    expect(o.EMPTY).toBe('');
  });
});

describe('applyMonorepoRootEnvToProcess', () => {
  let tmp: string;
  const prev = { ...process.env };

  afterEach(() => {
    if (tmp && fs.existsSync(tmp)) {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
    for (const k of Object.keys(process.env)) {
      if (!(k in prev)) {
        delete process.env[k];
      }
    }
    Object.assign(process.env, prev);
  });

  it('fills missing keys from repo .env', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-env-'));
    fs.writeFileSync(path.join(tmp, '.env'), 'CHAT_TEST_ONLY_ABC=fromfile\n', 'utf8');
    delete process.env.CHAT_TEST_ONLY_ABC;
    applyMonorepoRootEnvToProcess(tmp);
    expect(process.env.CHAT_TEST_ONLY_ABC).toBe('fromfile');
  });
});
