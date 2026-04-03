import { afterEach, describe, expect, it } from 'vitest';
import { isCopilotToolsAuthorized } from '@/lib/copilot/copilot-tools-auth';

describe('isCopilotToolsAuthorized', () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it('returns true when COPILOT_TOOLS_BEARER matches Authorization header', () => {
    process.env.COPILOT_TOOLS_BEARER = 'secret-token';
    delete process.env.SITE_CHAT_COPILOT_TOOLS;
    const req = new Request('http://localhost/', {
      headers: { Authorization: 'Bearer secret-token' },
    });
    expect(isCopilotToolsAuthorized(req)).toBe(true);
  });

  it('returns false when bearer is set but header missing', () => {
    process.env.COPILOT_TOOLS_BEARER = 'secret-token';
    const req = new Request('http://localhost/');
    expect(isCopilotToolsAuthorized(req)).toBe(false);
  });

  it('returns true when SITE_CHAT_COPILOT_TOOLS=1 and no bearer env', () => {
    delete process.env.COPILOT_TOOLS_BEARER;
    process.env.SITE_CHAT_COPILOT_TOOLS = '1';
    const req = new Request('http://localhost/');
    expect(isCopilotToolsAuthorized(req)).toBe(true);
  });

  it('returns false when neither bearer nor site flag', () => {
    delete process.env.COPILOT_TOOLS_BEARER;
    delete process.env.SITE_CHAT_COPILOT_TOOLS;
    const req = new Request('http://localhost/');
    expect(isCopilotToolsAuthorized(req)).toBe(false);
  });
});
