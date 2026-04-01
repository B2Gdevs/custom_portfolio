import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMagicbornCli, magicbornDomainBracket } from '@/lib/magicborn/magicborn-cli-ui';

describe('magicbornDomainBracket', () => {
  it('labels planning-pack distinctly from book', () => {
    expect(magicbornDomainBracket('planning-pack')).toBe('[planning-pack]');
    expect(magicbornDomainBracket('book')).toBe('[book]');
  });
});

describe('createMagicbornCli', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no-ops when disabled', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const ui = createMagicbornCli(false);
    ui.banner('x');
    ui.section('test');
    await ui.withLongRunning('wait', async () => {});
    await ui.withLongRunningResult('wait', async () => 1);
    expect(log).not.toHaveBeenCalled();
  });

  it('withLongRunningResult returns fn result when enabled', async () => {
    const ui = createMagicbornCli(true);
    const n = await ui.withLongRunningResult('job', async () => 42);
    expect(n).toBe(42);
  });
});
