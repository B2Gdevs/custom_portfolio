/** Browser URL for downloading a single doc MDX by content slug (e.g. `books/state`). */
export function docsSourceDownloadUrl(slug: string): string {
  const parts = slug.split('/').filter(Boolean);
  return `/api/docs/source/${parts.map(encodeURIComponent).join('/')}`;
}

export function docsArchiveDownloadUrl(prefix: string): string {
  return `/api/docs/archive?prefix=${encodeURIComponent(prefix)}`;
}
