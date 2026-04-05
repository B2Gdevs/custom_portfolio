import { Skeleton } from '@/components/ui/skeleton';
import { SKELETON_RESUME_GALLERY_CARD_COUNT } from '@/lib/ui/skeleton-defaults';
import { cn } from '@/lib/utils';

function ResumeCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-border/70 bg-dark-alt/55">
      <div className="border-b border-border/70 p-3">
        <Skeleton className="aspect-[4/5] w-full rounded-[1.4rem]" />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3 font-mono" />
      </div>
    </article>
  );
}

export function ResumeGallerySkeleton({
  cardCount = SKELETON_RESUME_GALLERY_CARD_COUNT,
  className,
}: {
  cardCount?: number;
  className?: string;
}) {
  return (
    <div className={cn('section-shell pb-16', className)}>
      <header className="story-card max-w-5xl p-8 md:p-10">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-12 w-full max-w-lg md:h-14" />
        <div className="mt-5 max-w-3xl space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: cardCount }, (_, i) => (
          <ResumeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
