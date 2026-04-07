import Link from 'next/link';

/**
 * Standalone chrome for `/docs/api` — no docs file tree, no `getAllContent`.
 * Site chrome still comes from root `SiteLayout`.
 */
export function ApiDocsPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="shrink-0 border-b border-border/80 bg-dark-alt/40 px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">HTTP APIs</p>
            <h1 className="font-display text-2xl font-semibold text-primary md:text-3xl">
              Public API reference
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-text-muted">
              OpenAPI 3 — interactive docs (Redoc). Only anonymous and site-session routes are listed;
              admin, Payload, and privileged routes are not documented here.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href="/docs"
              className="rounded-full border border-border px-3 py-1.5 font-medium text-primary transition-colors hover:border-accent hover:text-accent"
            >
              Documentation home
            </Link>
            <a
              href="/api/openapi"
              className="rounded-full border border-border px-3 py-1.5 font-medium text-text-muted transition-colors hover:border-accent hover:text-primary"
              target="_blank"
              rel="noreferrer"
            >
              Raw OpenAPI JSON
            </a>
          </nav>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
