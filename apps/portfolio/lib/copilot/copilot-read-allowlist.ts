/**
 * Copilot read tools — deny-by-default; only these collection slugs may be queried
 * via `copilotPayloadFind` / `copilotPayloadFindById` (see global-tooling-05-01).
 *
 * Excludes: users, tenants, RAG maintenance, reader-private collections.
 */
export const COPILOT_READ_COLLECTION_SLUGS = [
  'project-records',
  'site-app-records',
  'resume-records',
  'site-download-assets',
  'site-media-assets',
  'published-book-artifacts',
  'listen-catalog-records',
  'listen-media-assets',
  'book-series',
  'book-records',
  'scene-records',
  'scene-media-variants',
] as const;

export type CopilotReadCollectionSlug = (typeof COPILOT_READ_COLLECTION_SLUGS)[number];

export const COPILOT_READ_ALLOWLIST = new Set<string>(COPILOT_READ_COLLECTION_SLUGS);

export const COPILOT_READ_LIMITS = {
  maxDepth: 2,
  maxLimit: 25,
  defaultLimit: 10,
  maxPage: 500,
} as const;

export function isCopilotReadCollectionAllowed(slug: string): boolean {
  return COPILOT_READ_ALLOWLIST.has(slug);
}
