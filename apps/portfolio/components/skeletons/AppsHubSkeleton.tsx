import { LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SKELETON_APPS_HUB_CARD_COUNT } from '@/lib/ui/skeleton-defaults';
import { cn } from '@/lib/utils';

function AppCardSkeleton() {
  return (
    <article className="story-card flex h-full flex-col p-6 md:p-8">
      <div className="mb-4 flex items-start gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 w-3/5 max-w-xs" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
        </div>
      </div>
      <div className="mb-4 flex-1 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <Skeleton className="h-9 w-40 rounded-full" />
    </article>
  );
}

export function AppsHubSkeleton({
  cardCount = SKELETON_APPS_HUB_CARD_COUNT,
  className,
}: {
  cardCount?: number;
  className?: string;
}) {
  return (
    <div className={cn('section-shell pb-16', className)}>
      <header className="story-card max-w-5xl p-8 md:p-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/80 bg-dark-alt px-3 py-1">
          <LayoutGrid size={14} className="text-text-muted" aria-hidden />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="mt-2 h-12 w-full max-w-lg md:h-14" />
        <div className="mt-5 max-w-3xl space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-11/12" />
        </div>
      </header>

      <ul className="mt-10 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: cardCount }, (_, i) => (
          <li key={i}>
            <AppCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}
