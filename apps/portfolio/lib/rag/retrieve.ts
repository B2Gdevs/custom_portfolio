import { embedTexts } from './embeddings';
import { rerankRagHits, searchSemanticRagHits } from './search-db';

export async function retrieveRagContext(query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [];
  }

  const [queryEmbedding] = await embedTexts([normalizedQuery]);
  const semanticHits = searchSemanticRagHits(queryEmbedding, normalizedQuery, {
    candidateLimit: 12,
  });

  return rerankRagHits(normalizedQuery, semanticHits, {
    resultLimit: 6,
  });
}
