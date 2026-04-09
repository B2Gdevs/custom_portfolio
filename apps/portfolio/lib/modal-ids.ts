/** Registered modal type ids (see `lib/modal-registry.tsx`). */
export const PLANNING_PACK_MODAL_ID = 'planning-pack' as const;
export const CONTENT_SEARCH_MODAL_ID = 'content-search' as const;

export type KnownModalId =
  | typeof PLANNING_PACK_MODAL_ID
  | typeof CONTENT_SEARCH_MODAL_ID
  | (string & {});
