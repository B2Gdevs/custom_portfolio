import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Screenshot annotate context menu', () => {
  it('does not gate menu content on select-tool-only (upstream DefaultContextMenuContent does)', () => {
    const path = join(
      __dirname,
      '../../../components/screenshot-annotate/ScreenshotAnnotateContextMenu.tsx',
    );
    const src = readFileSync(path, 'utf8');
    expect(src).not.toMatch(/selectToolActive/);
    expect(src).toContain('ReorderMenuSubmenu');
    expect(src).toContain('ClipboardMenuGroup');
  });
});
