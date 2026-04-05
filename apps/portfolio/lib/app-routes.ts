/**
 * Routes that use full-viewport app chrome (no site footer, site sidebar not mounted).
 * Reader (`/apps/reader`) is **not** immersive for this check, but the portfolio sidebar is still hidden;
 * navigation lives in the reader workspace rail (`readerShellNavLinks` + library).
 */
export function isImmersiveAppsRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname === '/apps/screenshot-annotate' || pathname.startsWith('/apps/screenshot-annotate/')) {
    return true;
  }
  return false;
}

/** EPUB reader app — full-height inset; still uses {@link isImmersiveAppsRoute} = false for site shell. */
export function isReaderAppsRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === '/apps/reader' || pathname.startsWith('/apps/reader/');
}
