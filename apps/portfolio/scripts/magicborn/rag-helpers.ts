import { retrieveRagContext } from '@/lib/rag/retrieve';
import type { MagicbornCliConfig } from './cli-config';

export function normalizeRagBookSlug(
  values: Record<string, string | boolean | undefined>,
  cfg: MagicbornCliConfig,
): string | undefined {
  const fromFlag = (values.book as string | undefined)?.trim();
  if (fromFlag) return fromFlag;
  const fromSlug = (values.slug as string | undefined)?.trim();
  if (fromSlug) return fromSlug;
  return cfg.rag?.defaultBookSlug?.trim() || undefined;
}

export async function collectRagContext(params: {
  bookSlug?: string;
  query: string;
  maxHits: number;
}) {
  const hits = await retrieveRagContext(params.query);
  const filtered = params.bookSlug
    ? hits.filter(
        (h) =>
          h.sourcePath.includes(params.bookSlug as string) ||
          h.publicUrl.includes(params.bookSlug as string),
      )
    : hits;
  return filtered.slice(0, params.maxHits);
}
