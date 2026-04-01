/**
 * Single source of truth for Magicborn-line image generations (covers, scenes, marketing).
 * Refine in-repo; consumed by composeMagicbornImagePrompt + optional API flags.
 */
export const MAGICBORN_IMAGE_STYLE_BLOCK = `
Magicborn Studios fantasy book art: rich but readable, cinematic lighting, painterly
digital illustration, coherent anatomy, no text in the image, no logos, no watermarks.
Palette favors deep ember golds, ink blues, and weathered neutrals; subtle film grain
or canvas texture is fine. Avoid generic stock fantasy; aim for a distinctive,
mature-YA novel cover tone suitable for epic fantasy with political and mythic stakes.
`.trim();
