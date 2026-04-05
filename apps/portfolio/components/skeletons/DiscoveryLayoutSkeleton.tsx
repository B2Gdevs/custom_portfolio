import { Skeleton } from '@/components/ui/skeleton';
import { LISTEN_DISCOVERY_PANEL_CLASS } from '@/components/content/DiscoveryIndexLayout';
import {
  SKELETON_DISCOVERY_CARD_COUNT,
  type SkeletonDiscoveryKind,
} from '@/lib/ui/skeleton-defaults';
import { cn } from '@/lib/utils';

const PANEL_CLASS: Record<SkeletonDiscoveryKind, string> = {
  blog: 'bg-[radial-gradient(circle_at_top_left,rgba(214,163,121,0.16),transparent_45%),rgba(26,21,18,0.88)]',
  projects:
    'bg-[radial-gradient(circle_at_top_left,rgba(133,175,111,0.16),transparent_45%),rgba(22,27,20,0.88)]',
  listen: LISTEN_DISCOVERY_PANEL_CLASS,
};

function DiscoveryArticleSkeleton() {
  return (
    <article className="rounded-[2rem] border border-border/70 bg-dark-alt/55 p-6">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="mt-4 h-8 w-4/5 max-w-xl" />
      <Skeleton className="mt-2 h-4 w-32" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
    </article>
  );
}

export function DiscoveryLayoutSkeleton({
  kind,
  cardCount,
}: {
  kind: SkeletonDiscoveryKind;
  cardCount?: number;
}) {
  const n = cardCount ?? SKELETON_DISCOVERY_CARD_COUNT[kind];
  const panel = PANEL_CLASS[kind];

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <aside
        className={cn(
          'sticky top-24 hidden h-fit w-72 shrink-0 rounded-[2rem] border border-border/70 p-5 lg:block',
          panel
        )}
      >
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-36" />
          </div>
        </div>
        <Skeleton className="mt-3 h-12 w-full" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-3 w-12" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-14 rounded-full" />
          </div>
          <Skeleton className="h-3 w-14" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-12 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'rounded-[2rem] border border-border/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]',
            panel
          )}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-11 rounded-2xl" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-10 w-full max-w-md sm:h-12" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
            <div className="flex gap-3 lg:w-[26rem]">
              <Skeleton className="h-11 flex-1 rounded-2xl" />
              <Skeleton className="h-11 w-20 rounded-2xl lg:hidden" />
              <Skeleton className="hidden h-11 w-16 rounded-2xl xl:block" />
            </div>
          </div>
          <Skeleton className="mt-6 h-4 w-32" />
        </div>

        <div className="mt-8 space-y-5">
          {Array.from({ length: n }, (_, i) => (
            <DiscoveryArticleSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
