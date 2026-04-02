import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  CHAT_PROD_DIST_DIR,
  hasChatProductionBuild,
  resolveChatServePort,
} from '../src/tui/chat-next-common.js';

describe('resolveChatServePort', () => {
  it('defaults and parses like dev port', () => {
    expect(resolveChatServePort(undefined)).toBe(3010);
    expect(resolveChatServePort('3020')).toBe(3020);
    expect(resolveChatServePort('0')).toBe(3010);
  });
});

describe('hasChatProductionBuild', () => {
  let tmp: string;
  afterEach(() => {
    if (tmp && fs.existsSync(tmp)) {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('is false without BUILD_ID', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-chat-'));
    expect(hasChatProductionBuild(tmp)).toBe(false);
  });

  it('is true when .next-chat/BUILD_ID exists', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-chat-'));
    const d = path.join(tmp, CHAT_PROD_DIST_DIR);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'BUILD_ID'), 'test-build', 'utf8');
    expect(hasChatProductionBuild(tmp)).toBe(true);
  });
});
