import { z } from 'zod';

/** Allowed characters in tree path segments (virtual paths like `content/docs/books/planning`). */
const TREE_PATH_PART = /^[\w./-]+$/;

const openStringSchema = z.string().max(4000);

export function parseDocsOpenParam(raw: string | null | undefined): Set<string> {
  if (raw == null || raw === '') {
    return new Set();
  }
  const safe = openStringSchema.safeParse(raw);
  if (!safe.success) {
    return new Set();
  }
  const parts = safe.data
    .split(',')
    .map((p) => {
      try {
        return decodeURIComponent(p.trim());
      } catch {
        return p.trim();
      }
    })
    .filter((p) => p.length > 0 && TREE_PATH_PART.test(p));
  return new Set(parts);
}

export function serializeDocsOpenParam(expanded: Set<string>): string | undefined {
  if (expanded.size === 0) return undefined;
  const sorted = [...expanded].sort();
  return sorted.map((p) => encodeURIComponent(p)).join(',');
}
