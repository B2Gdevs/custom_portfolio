import type { MediaImageSize } from '@/lib/site-media';

export type GenerateTarget = 'book' | 'app' | 'project' | 'planning-pack' | 'listen';

export const GENERATE_TARGETS: GenerateTarget[] = ['book', 'app', 'project', 'planning-pack', 'listen'];

export const IMAGE_SIZES: MediaImageSize[] = ['1024x1024', '1792x1024', '1024x1792'];

export function asGenerateTarget(s: string | undefined): GenerateTarget | undefined {
  if (!s) return undefined;
  return GENERATE_TARGETS.includes(s as GenerateTarget) ? (s as GenerateTarget) : undefined;
}

export function parseImageSize(s: string | undefined): MediaImageSize {
  const v = s?.trim();
  if (!v) return '1024x1024';
  if (IMAGE_SIZES.includes(v as MediaImageSize)) return v as MediaImageSize;
  throw new Error(`Invalid --size ${v}. Use: ${IMAGE_SIZES.join(', ')}`);
}

export type GenerateManifestBase = {
  version: 1;
  target: GenerateTarget;
  raw: boolean;
  useMagicbornStyle: boolean;
  seed?: string;
  promptFragment?: string;
  slug?: string;
  id?: string;
  pack?: string;
  mediaSlot?: string;
  model: string;
  size: MediaImageSize;
};

export const generateParseOptions = {
  slug: { type: 'string' as const },
  id: { type: 'string' as const },
  pack: { type: 'string' as const },
  prompt: { type: 'string' as const },
  seed: { type: 'string' as const },
  'scene-key': { type: 'string' as const },
  'scene-text': { type: 'string' as const },
  'print-prompt': { type: 'boolean' as const, default: false },
  'dry-run': { type: 'boolean' as const, default: false },
  json: { type: 'boolean' as const, default: false },
  raw: { type: 'boolean' as const, default: false },
  size: { type: 'string' as const },
  slot: { type: 'string' as const },
  'with-rag': { type: 'boolean' as const, default: false },
  book: { type: 'string' as const },
  'rag-query': { type: 'string' as const },
};

export const batchParseOptions = {
  style: { type: 'string' as const },
  target: { type: 'string' as const, default: 'project' },
  medium: { type: 'string' as const, default: 'image' },
  scenes: { type: 'string' as const },
  'scenes-file': { type: 'string' as const },
  'continue-on-error': { type: 'boolean' as const, default: false },
  slug: { type: 'string' as const },
  id: { type: 'string' as const },
  pack: { type: 'string' as const },
  'print-prompt': { type: 'boolean' as const, default: false },
  'dry-run': { type: 'boolean' as const, default: false },
  json: { type: 'boolean' as const, default: false },
  raw: { type: 'boolean' as const, default: false },
  size: { type: 'string' as const },
  slot: { type: 'string' as const },
};

export const extractParseOptions = {
  json: { type: 'boolean' as const, default: false },
  file: { type: 'string' as const },
  slug: { type: 'string' as const },
  'all-headings': { type: 'boolean' as const, default: false },
};
