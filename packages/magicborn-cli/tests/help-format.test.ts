import { Command } from 'commander';
import { afterEach, describe, expect, it } from 'vitest';
import { formatMagicbornRootHelp } from '../src/help-format.ts';

describe('formatMagicbornRootHelp', () => {
  afterEach(() => {
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
  });

  it('includes grouped sections and pnpm passthrough (no ANSI with NO_COLOR)', () => {
    process.env.NO_COLOR = '1';
    const program = new Command();
    program.name('magicborn').description('Test').version('0.0.0');
    program.command('book').description('Books');
    program.command('payload').description('Payload');

    const text = formatMagicbornRootHelp(program);
    expect(text).toContain('Asset & repo');
    expect(text).toContain('book');
    expect(text).toContain('Payload CMS catalog');
    expect(text).toContain('payload');
    expect(text).toContain('Workspace passthrough');
    expect(text).toContain('pnpm <args>');
    expect(text).not.toMatch(/\x1b\[/);
  });
});
