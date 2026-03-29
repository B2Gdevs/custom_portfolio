/** Canonical in-site EPUB reader (query-param book switcher + optional deep link). */

export type ReaderAppSearch = {
  book?: string;
  /** EPUB spine / resource href (path inside the archive). */
  at?: string;
  /** epub.js CFI string. */
  cfi?: string;
};

export function readerAppHref(opts?: ReaderAppSearch): string {
  const p = new URLSearchParams();
  if (opts?.book) p.set('book', opts.book);
  if (opts?.at) p.set('at', opts.at);
  if (opts?.cfi) p.set('cfi', opts.cfi);
  const q = p.toString();
  return q ? `/apps/reader?${q}` : '/apps/reader';
}
