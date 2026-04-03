/** Collections allowed for `POST /api/copilot/create` (narrower than read allowlist). */
export const COPILOT_MUTATE_COLLECTION_SLUGS = ['project-records', 'site-app-records'] as const;

export const COPILOT_MUTATE_ALLOWLIST = new Set<string>(COPILOT_MUTATE_COLLECTION_SLUGS);

export function isCopilotMutateCollectionAllowed(slug: string): boolean {
  return COPILOT_MUTATE_ALLOWLIST.has(slug);
}
