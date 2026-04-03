import type { SiteChatRagMode } from '@/lib/site-chat';
import { embedTexts } from './embeddings';
import { rerankRagHits, searchSemanticRagHits } from './search-db';
import type { RagSearchHit } from './types';

/** Narrow default site index by path until chunk metadata splits land (see global-tooling-04-03). */
export function filterRagHitsByMode(hits: RagSearchHit[], mode: SiteChatRagMode | undefined): RagSearchHit[] {
  if (!mode || mode === 'off' || mode === 'books_planning_repo') {
    return hits;
  }
  const norm = (h: RagSearchHit) => h.sourcePath.replace(/\\/g, '/').toLowerCase();
  const inBooks = (h: RagSearchHit) => norm(h).includes('/content/docs/books/');
  if (mode === 'books') {
    return hits.filter((h) => inBooks(h) && !norm(h).includes('/planning/'));
  }
  if (mode === 'books_planning') {
    return hits.filter(inBooks);
  }
  return hits;
}

export async function retrieveRagContext(
  query: string,
  options?: { ragMode?: SiteChatRagMode },
): Promise<RagSearchHit[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [];
  }

  const [queryEmbedding] = await embedTexts([normalizedQuery]);
  const semanticHits = await searchSemanticRagHits(queryEmbedding, normalizedQuery, {
    candidateLimit: 12,
  });

  const ranked = await rerankRagHits(normalizedQuery, semanticHits, {
    resultLimit: 6,
  });
  return filterRagHitsByMode(ranked, options?.ragMode);
}
