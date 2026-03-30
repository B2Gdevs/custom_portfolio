/**
 * BandLab track embeds use `https://www.bandlab.com/embed/?id=<revisionId>`.
 * Effect preset pages live at `https://www.bandlab.com/effect-presets/<compositeId>`;
 * the matching embed frame is `https://www.bandlab.com/embed/effect-preset/<compositeId>`.
 */
const EFFECT_PRESET_PAGE = /bandlab\.com\/effect-presets\/([^?#]+)/i;

export function bandlabEffectPresetEmbedSrc(bandlabPageUrl: string): string | null {
  const match = bandlabPageUrl.trim().match(EFFECT_PRESET_PAGE);
  if (!match?.[1]) return null;
  const id = match[1].replace(/\/+$/, '');
  if (!id) return null;
  return `https://www.bandlab.com/embed/effect-preset/${id}`;
}

/** Effective iframe `src` for catalog rows (tracks use stored embedUrl; presets derive from page URL). */
export function resolveListenEmbedSrc(entry: {
  catalogKind: 'track' | 'preset';
  embedUrl: string;
  bandlabUrl: string;
}): string {
  const trimmed = entry.embedUrl.trim();
  if (trimmed) return trimmed;
  if (entry.catalogKind === 'preset') {
    return bandlabEffectPresetEmbedSrc(entry.bandlabUrl) ?? '';
  }
  return '';
}
