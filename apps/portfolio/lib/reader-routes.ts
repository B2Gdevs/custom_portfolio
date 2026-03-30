import {
  readerAppHref as readerAppHrefWithBase,
  type ReaderAppSearch,
} from '@portfolio/repub-builder/reader';

export type { ReaderAppSearch } from '@portfolio/repub-builder/reader';

/** Canonical in-site EPUB reader (query-param book switcher + optional deep link). */
export function readerAppHref(opts?: ReaderAppSearch): string {
  return readerAppHrefWithBase('/apps/reader', opts);
}
