import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Screenshot annotate style panel', () => {
  it('includes stroke, color, and text pickers; omits arrow-only rows', () => {
    const path = join(
      __dirname,
      '../../../components/screenshot-annotate/ScreenshotAnnotateStylePanel.tsx',
    );
    const src = readFileSync(path, 'utf8');
    expect(src).toContain('StylePanelColorPicker');
    expect(src).toContain('StylePanelSizePicker');
    expect(src).toContain('StylePanelFontPicker');
    expect(src).not.toContain('StylePanelArrowKindPicker');
    expect(src).not.toContain('StylePanelSplinePicker');
  });
});
