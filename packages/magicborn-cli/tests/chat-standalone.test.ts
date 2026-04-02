import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { CHAT_PROD_DIST_DIR } from '../src/tui/chat-next-common.js';
import { findChatStandaloneServerJs } from '../src/tui/chat-standalone.js';

describe('findChatStandaloneServerJs', () => {
  let tmp: string;
  afterEach(() => {
    if (tmp && fs.existsSync(tmp)) {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('returns null when standalone tree is missing', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-standalone-'));
    expect(findChatStandaloneServerJs(tmp)).toBeNull();
  });

  it('finds nested apps/portfolio/server.js', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-standalone-'));
    const nested = path.join(tmp, CHAT_PROD_DIST_DIR, 'standalone', 'apps', 'portfolio');
    fs.mkdirSync(nested, { recursive: true });
    fs.writeFileSync(path.join(nested, 'server.js'), '// stub', 'utf8');
    expect(findChatStandaloneServerJs(tmp)).toBe(path.join(nested, 'server.js'));
  });

  it('finds root standalone/server.js', () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-standalone-'));
    const root = path.join(tmp, CHAT_PROD_DIST_DIR, 'standalone');
    fs.mkdirSync(root, { recursive: true });
    fs.writeFileSync(path.join(root, 'server.js'), '// stub', 'utf8');
    expect(findChatStandaloneServerJs(tmp)).toBe(path.join(root, 'server.js'));
  });
});
