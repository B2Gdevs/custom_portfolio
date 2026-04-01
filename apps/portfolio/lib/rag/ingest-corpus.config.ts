/**
 * RAG ingestion corpus — edit this file to change what gets embedded for site chat / search.
 * Scoped to `apps/portfolio` MDX content; ingest always runs in that app context.
 */

/** Content collections the RAG pipeline may index (must match `lib/content` types). */
export type RagContentType = 'docs' | 'projects' | 'blog';

export const ragIngestCorpus = {
  /**
   * MDX collections under `content/<type>/` to include.
   * Each maps to `getAllContent(type)` in the content layer.
   */
  contentTypes: ['docs', 'projects', 'blog'] as const satisfies readonly RagContentType[],

  /**
   * For `docs` only: last path segment must not be in this set (planning / meta leaves).
   */
  excludedDocLeafSlugs: [
    'planning-docs',
    'state',
    'task-registry',
    'errors-and-attempts',
    'decisions',
    'requirements',
    'roadmap',
    'global-planning',
    'implementation-plan',
  ] as const,
} as const;
