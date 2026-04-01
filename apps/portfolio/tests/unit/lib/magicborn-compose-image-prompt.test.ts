import { describe, expect, it } from 'vitest';
import { composeMagicbornImagePrompt } from '@/lib/magicborn-prompts/compose-image-prompt';
import { MAGICBORN_IMAGE_STYLE_BLOCK } from '@/lib/magicborn-prompts/style-block';

describe('composeMagicbornImagePrompt', () => {
  it('returns style only when no scene', () => {
    expect(composeMagicbornImagePrompt()).toBe(MAGICBORN_IMAGE_STYLE_BLOCK.trim());
  });

  it('appends scene text after separator', () => {
    const out = composeMagicbornImagePrompt({ sceneText: 'A lone tower at dusk.' });
    expect(out.startsWith(MAGICBORN_IMAGE_STYLE_BLOCK.trim())).toBe(true);
    expect(out).toContain('---');
    expect(out).toContain('lone tower');
  });

  it('resolves sceneKey and uses prompt as extra when key set', () => {
    const out = composeMagicbornImagePrompt({
      sceneKey: 'mordreds-tale:ash-court-tension',
      extraInstructions: 'Add more candle smoke.',
    });
    expect(out).toContain('council chamber');
    expect(out).toContain('candle smoke');
  });
});
