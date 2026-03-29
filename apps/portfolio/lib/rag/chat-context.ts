import type { RagSearchHit } from './types';

const MAX_CONTEXT_HITS = 5;

function normalizeSnippet(snippet: string) {
  return snippet.replace(/\s+/g, ' ').trim();
}

export function buildRagSourceHref(hit: Pick<RagSearchHit, 'publicUrl' | 'anchor'>) {
  return hit.anchor ? `${hit.publicUrl}#${hit.anchor}` : hit.publicUrl;
}

export function buildRagSystemMessage(hits: RagSearchHit[]) {
  if (!hits.length) {
    return '';
  }

  const contextLines = hits.slice(0, MAX_CONTEXT_HITS).map((hit, index) => {
    const heading = hit.heading ? ` | ${hit.heading}` : '';
    const href = buildRagSourceHref(hit);
    return [
      `${index + 1}. ${hit.title}${heading}`,
      `Source: ${href}`,
      `Excerpt: ${normalizeSnippet(hit.snippet || hit.content).slice(0, 320)}`,
    ].join('\n');
  });

  return [
    'Use the retrieval context below when it is relevant to the latest user message.',
    'Stay grounded in these public-site sources, keep the answer concise, and do not invent facts beyond them.',
    '',
    'Retrieved context:',
    ...contextLines,
  ].join('\n');
}
