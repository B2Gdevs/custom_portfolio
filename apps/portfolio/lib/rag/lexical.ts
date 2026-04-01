/** Shared snippet + lexical helpers for RAG search (SQLite FTS + Postgres rerank). */

export function buildSnippet(content: string, query: string): string {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return content.slice(0, 220);
  }

  const index = content.toLowerCase().indexOf(normalizedQuery);
  if (index < 0) {
    return content.slice(0, 220);
  }

  const start = Math.max(0, index - 80);
  const end = Math.min(content.length, index + normalizedQuery.length + 140);
  return `${start > 0 ? '...' : ''}${content.slice(start, end)}${end < content.length ? '...' : ''}`;
}

export function buildFtsQuery(query: string): string | null {
  const tokens = query.match(/[a-zA-Z0-9]{2,}/g) ?? [];
  if (!tokens.length) {
    return null;
  }

  return tokens
    .slice(0, 8)
    .map((token) => `"${token.replace(/"/g, '""')}"`)
    .join(' OR ');
}

/** 0–1 overlap score for hybrid rerank when BM25 is unavailable (e.g. pgvector path). */
export function lexicalOverlap(text: string, query: string): number {
  const tokens = query.match(/[a-zA-Z0-9]{2,}/g) ?? [];
  if (!tokens.length) {
    return 0;
  }
  const lower = text.toLowerCase();
  let hits = 0;
  for (const t of tokens.slice(0, 8)) {
    if (lower.includes(t.toLowerCase())) {
      hits += 1;
    }
  }
  return hits / Math.min(tokens.length, 8);
}
