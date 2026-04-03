import { describe, expect, it } from 'vitest';
import { defaultCliTheme, resolveCliTheme } from '@magicborn/mb-cli-framework';

describe('CliTheme', () => {
  it('includes slash + footerAccent tokens (global-tooling-04-01)', () => {
    expect(defaultCliTheme.slash).toBeDefined();
    expect(defaultCliTheme.footerAccent).toBeDefined();
  });

  it('resolveCliTheme merges overrides', () => {
    const t = resolveCliTheme({ slash: 'magenta' });
    expect(t.slash).toBe('magenta');
    expect(t.footerAccent).toBe(defaultCliTheme.footerAccent);
  });
});
