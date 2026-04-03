const EMAIL_PATH_PATTERN = /(^|\/)[^/]*@[^/]+($|\/)/i;
const PORTFOLIO_IGNORED_PREFIXES = ['/admin', '/api', '/auth', '/login', '/logout'];

export type AnalyticsPageEvent = {
  url: string;
};

export function sanitizeAnalyticsPageEvent<T extends AnalyticsPageEvent>(event: T): null | T {
  let parsed: URL;

  try {
    parsed = new URL(event.url);
  } catch {
    return null;
  }

  const pathname = normalizePathname(parsed.pathname);
  if (shouldIgnorePortfolioAnalyticsPath(pathname)) {
    return null;
  }

  parsed.pathname = pathname;
  parsed.search = '';
  parsed.hash = '';

  return {
    ...event,
    url: parsed.toString(),
  };
}

function normalizePathname(pathname: string) {
  if (!pathname) {
    return '/';
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function shouldIgnorePortfolioAnalyticsPath(pathname: string) {
  if (!pathname.startsWith('/')) {
    return true;
  }

  if (EMAIL_PATH_PATTERN.test(pathname)) {
    return true;
  }

  return PORTFOLIO_IGNORED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
