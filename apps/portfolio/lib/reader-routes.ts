export interface ReaderAppSearch {
  book?: string;
  record?: string;
  at?: string;
  cfi?: string;
}

/** Canonical in-site EPUB reader (query-param book switcher + optional deep link). */
export function readerAppHref(opts?: ReaderAppSearch): string {
  const params = new URLSearchParams();

  if (opts?.book) params.set('book', opts.book);
  if (opts?.record) params.set('record', opts.record);
  if (opts?.at) params.set('at', opts.at);
  if (opts?.cfi) params.set('cfi', opts.cfi);

  const query = params.toString();
  return query ? `/apps/reader?${query}` : '/apps/reader';
}
