import { MAGICBORN_IMAGE_STYLE_BLOCK } from './style-block';
import { getMagicbornSceneSeed } from './scene-seeds';

export type ComposeMagicbornImagePromptInput = {
  /** Full scene text (skips sceneKey lookup when set) */
  sceneText?: string;
  /** Looks up curated seed from scene-seeds.ts */
  sceneKey?: string;
  /** User or Copilot-provided fragment appended after the scene */
  extraInstructions?: string;
  /** Override default style block (tests / experiments) */
  styleBlock?: string;
};

const SEPARATOR = '\n\n---\n\n';

/**
 * Final OpenAI Images prompt: Magicborn style + scene (+ optional extras).
 */
export function composeMagicbornImagePrompt(
  input: ComposeMagicbornImagePromptInput = {},
): string {
  const style = (input.styleBlock ?? MAGICBORN_IMAGE_STYLE_BLOCK).trim();
  const parts: string[] = [];

  const fromKey = input.sceneKey?.trim()
    ? getMagicbornSceneSeed(input.sceneKey.trim())?.prompt
    : undefined;
  const scene =
    input.sceneText?.trim() || fromKey?.trim() || '';

  if (scene) {
    parts.push(scene);
  }

  const extra = input.extraInstructions?.trim();
  if (extra) {
    parts.push(extra);
  }

  const sceneBlock = parts.join('\n\n');
  if (!sceneBlock) {
    return style;
  }

  return `${style}${SEPARATOR}${sceneBlock}`;
}
