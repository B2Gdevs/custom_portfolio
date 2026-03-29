import type { BookPlanningLink } from '@/lib/repo-planner/book-planning-context';

/** Planning MDX routes for Mordred's Tale (books section). */
export const MORDREDS_TALE_PLANNING_LINKS: BookPlanningLink[] = [
  { href: '/docs/books/planning/mordreds-tale-state', label: 'State' },
  { href: '/docs/books/planning/mordreds-tale-task-registry', label: 'Tasks' },
  { href: '/docs/books/planning/mordreds-tale-decisions', label: 'Decisions' },
];

/** Payload for `openModal(REPO_PLANNER_MODAL_ID, …)` from the EPUB reader strip. */
export function mordredsTaleRepoPlannerModalPayload() {
  return {
    bookSlug: 'mordreds_tale',
    bookTitle: "Mordred's Tale",
    planningLinks: MORDREDS_TALE_PLANNING_LINKS,
    embedReader: true as const,
  };
}
