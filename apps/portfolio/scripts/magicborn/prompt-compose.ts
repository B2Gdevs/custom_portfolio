import { composeMagicbornImagePrompt } from '@/lib/magicborn-prompts/compose-image-prompt';
import { getMagicbornSceneSeed } from '@/lib/magicborn-prompts/scene-seeds';
import type { MagicbornCliConfig } from './cli-config';
import type { GenerateTarget } from './generate-config';

export function buildContextExtra(
  target: GenerateTarget,
  values: Record<string, string | undefined>,
): string {
  return [
    target === 'book' && values.slug ? `Book slug: ${values.slug}.` : '',
    (target === 'app' || target === 'project') && values.id
      ? `${target === 'project' ? 'Project' : 'App'} id: ${values.id}.`
      : '',
    target === 'planning-pack' && values.pack ? `Planning pack: ${values.pack}.` : '',
    target === 'listen' && values.slug ? `Listen slug: ${values.slug}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Free-form creative text: `--prompt` (preferred) or deprecated `--scene-text`. */
export function resolvePromptBody(values: Record<string, string | boolean | undefined>): string | undefined {
  const p = (values.prompt as string | undefined)?.trim();
  if (p) return p;
  return (values['scene-text'] as string | undefined)?.trim();
}

/** Curated seed: `--seed` (preferred) or deprecated `--scene-key`. */
export function resolveSeedKey(values: Record<string, string | boolean | undefined>): string | undefined {
  const s = (values.seed as string | undefined)?.trim();
  if (s) return s;
  return (values['scene-key'] as string | undefined)?.trim();
}

export function composeFinalPrompt(
  target: GenerateTarget,
  values: Record<string, string | boolean | undefined>,
  raw: boolean,
): string {
  const sceneKey = resolveSeedKey(values);
  const promptBody = resolvePromptBody(values);
  const extra = buildContextExtra(target, {
    slug: values.slug as string | undefined,
    id: values.id as string | undefined,
    pack: values.pack as string | undefined,
  });

  if (!raw) {
    return composeMagicbornImagePrompt({
      sceneKey,
      sceneText: promptBody,
      extraInstructions: extra || undefined,
    });
  }

  const parts: string[] = [];
  if (promptBody) parts.push(promptBody);
  if (sceneKey) {
    const seed = getMagicbornSceneSeed(sceneKey);
    if (seed?.prompt) parts.push(seed.prompt);
  }
  if (extra.trim()) parts.push(extra);
  return parts.join('\n\n').trim();
}

export function finalizeImagePrompt(
  target: GenerateTarget,
  values: Record<string, string | boolean | undefined>,
  raw: boolean,
  cliConfig: MagicbornCliConfig,
): string {
  let finalPrompt = composeFinalPrompt(target, values, raw);
  if (!raw && cliConfig.styleBlock?.trim()) {
    finalPrompt = composeMagicbornImagePrompt({
      sceneText: resolvePromptBody(values),
      sceneKey: resolveSeedKey(values),
      extraInstructions: buildContextExtra(target, {
        slug: values.slug as string | undefined,
        id: values.id as string | undefined,
        pack: values.pack as string | undefined,
      }),
      styleBlock: cliConfig.styleBlock,
    });
  }
  return finalPrompt;
}
