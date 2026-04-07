import Link from 'next/link';

/**
 * Shared top bar for `/apps/*` tools: kicker + title + link back to the apps hub.
 */
export function AppsToolPageHeader({
  title,
  kicker = 'Apps',
}: {
  title: string;
  kicker?: string;
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/80 px-4 py-3 md:px-6">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{kicker}</p>
        <h1 className="truncate font-display text-lg text-primary md:text-xl">{title}</h1>
      </div>
      <Link
        href="/apps"
        className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-accent hover:text-primary md:text-sm"
      >
        All apps
      </Link>
    </header>
  );
}
