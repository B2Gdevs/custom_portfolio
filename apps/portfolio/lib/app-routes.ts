/**
 * Routes that use full-viewport app chrome (no site footer, site sidebar not mounted).
 */
export function isImmersiveAppsRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname === '/apps/reader' || pathname.startsWith('/apps/reader/')) return true;
  if (pathname === '/apps/screenshot-annotate' || pathname.startsWith('/apps/screenshot-annotate/')) {
    return true;
  }
  return false;
}
