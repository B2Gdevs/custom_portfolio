import { describe, expect, it } from 'vitest';
import { hostSuggestsLocalPortfolioAccess } from '@/lib/site-copilot-shell';

describe('hostSuggestsLocalPortfolioAccess', () => {
  it('matches localhost and loopback', () => {
    expect(hostSuggestsLocalPortfolioAccess('localhost')).toBe(true);
    expect(hostSuggestsLocalPortfolioAccess('localhost:3000')).toBe(true);
    expect(hostSuggestsLocalPortfolioAccess('127.0.0.1')).toBe(true);
    expect(hostSuggestsLocalPortfolioAccess('[::1]:3000')).toBe(true);
  });

  it('matches common private LAN ranges', () => {
    expect(hostSuggestsLocalPortfolioAccess('192.168.1.64:3000')).toBe(true);
    expect(hostSuggestsLocalPortfolioAccess('10.0.0.5')).toBe(true);
    expect(hostSuggestsLocalPortfolioAccess('172.16.0.1')).toBe(true);
  });

  it('rejects empty and public-looking hosts', () => {
    expect(hostSuggestsLocalPortfolioAccess(null)).toBe(false);
    expect(hostSuggestsLocalPortfolioAccess('')).toBe(false);
    expect(hostSuggestsLocalPortfolioAccess('example.com')).toBe(false);
  });
});
