import { describe, expect, it } from 'vitest';
import { resolveChatDevPort } from '../src/tui/start-portfolio-chat-dev.js';

describe('resolveChatDevPort', () => {
  it('defaults to 3010', () => {
    expect(resolveChatDevPort(undefined)).toBe(3010);
    expect(resolveChatDevPort('')).toBe(3010);
  });
  it('parses valid ports', () => {
    expect(resolveChatDevPort('3020')).toBe(3020);
    expect(resolveChatDevPort('1')).toBe(1);
    expect(resolveChatDevPort('65535')).toBe(65535);
  });
  it('falls back on invalid', () => {
    expect(resolveChatDevPort('0')).toBe(3010);
    expect(resolveChatDevPort('999999')).toBe(3010);
    expect(resolveChatDevPort('abc')).toBe(3010);
  });
});
