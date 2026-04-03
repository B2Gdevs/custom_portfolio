import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  isAcceptEditsAutoEnvLocked,
  readCliSession,
  readCliSessionFile,
  toggleAcceptEditsAuto,
  writeCliSessionMerge,
} from '@magicborn/mb-cli-framework';

describe('cli-session', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-cli-session-'));
    delete process.env.MAGICBORN_ACCEPT_EDITS_AUTO;
  });

  afterEach(() => {
    delete process.env.MAGICBORN_ACCEPT_EDITS_AUTO;
    try {
      fs.rmSync(tmp, { recursive: true, force: true });
    } catch {
      /* tmp may be missing if test failed early */
    }
  });

  it('readCliSessionFile returns {} when missing', () => {
    expect(readCliSessionFile(tmp)).toEqual({});
  });

  it('writeCliSessionMerge persists and readCliSession reads file', () => {
    writeCliSessionMerge(tmp, { acceptEditsAuto: true });
    expect(readCliSessionFile(tmp).acceptEditsAuto).toBe(true);
    expect(readCliSession(tmp).acceptEditsAuto).toBe(true);
  });

  it('MAGICBORN_ACCEPT_EDITS_AUTO overrides file', () => {
    writeCliSessionMerge(tmp, { acceptEditsAuto: false, chatModel: 'gpt-4o-mini' });
    process.env.MAGICBORN_ACCEPT_EDITS_AUTO = '1';
    expect(readCliSession(tmp).acceptEditsAuto).toBe(true);
    expect(readCliSession(tmp).chatModel).toBe('gpt-4o-mini');
    expect(isAcceptEditsAutoEnvLocked()).toBe(true);
  });

  it('writeCliSessionMerge can clear ragMode', () => {
    writeCliSessionMerge(tmp, { ragMode: 'off' });
    expect(readCliSessionFile(tmp).ragMode).toBe('off');
    writeCliSessionMerge(tmp, { ragMode: undefined });
    expect(readCliSessionFile(tmp).ragMode).toBeUndefined();
  });

  it('toggleAcceptEditsAuto flips file-backed value', () => {
    expect(toggleAcceptEditsAuto(tmp, false).acceptEditsAuto).toBe(true);
    expect(toggleAcceptEditsAuto(tmp, true).acceptEditsAuto).toBe(false);
  });
});
