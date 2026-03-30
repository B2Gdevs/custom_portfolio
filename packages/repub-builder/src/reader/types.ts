import type { AnchorHTMLAttributes, ComponentType } from 'react';

/** Minimal book row for the reader shell (matches portfolio `BookEntry` subset). */
export type ReaderBookEntry = {
  slug: string;
  title: string;
  author?: string;
  description?: string;
  coverImage?: string;
  /** Display labels (from `book.json` → manifest). */
  genres?: string[];
  hasEpub: boolean;
};

export type ReaderAppSearch = {
  book?: string;
  at?: string;
  cfi?: string;
};

export type ReaderLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export type ReaderLinkComponent = ComponentType<ReaderLinkProps>;

export type ReaderPlanningQuickLink = {
  href: string;
  label: string;
};

/**
 * Neutral planning payload passed from the reader package to a host-supplied
 * cockpit surface. The reader should not depend on a host-specific modal schema.
 */
export type ReaderPlanningCockpitPayload = {
  readingTargetId: string;
  surfaceLabel?: string;
  quickLinks?: ReaderPlanningQuickLink[];
};

export type ReaderPlanningStripConfig = {
  /** Optional quick links (e.g. apps routes). Omit or leave empty to hide the expandable link row. */
  planningLinks?: ReaderPlanningQuickLink[];
  cockpitPayload: ReaderPlanningCockpitPayload;
};
