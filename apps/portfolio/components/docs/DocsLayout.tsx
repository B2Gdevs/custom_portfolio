'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { ContentMeta } from '@/lib/content';
import { DocsFileTreeNav } from '@/components/docs/DocsFileTreeNav';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { SKELETON_DOCS_NAV_LINE_COUNT } from '@/lib/ui/skeleton-defaults';
import { cn } from '@/lib/utils';

interface DocsLayoutProps {
  children: React.ReactNode;
  docs: Array<{ meta: ContentMeta; slug: string }>;
}

function DocsNavFallback() {
  return (
    <div className="space-y-2 border border-border/40 bg-dark-alt/30 p-2" aria-hidden>
      {Array.from({ length: SKELETON_DOCS_NAV_LINE_COUNT }, (_, i) => {
        const depth = [0, 1, 1, 2, 2][i % 5];
        return (
          <Skeleton
            key={i}
            className={cn(
              'h-3.5 rounded',
              depth === 0 && 'w-[92%]',
              depth === 1 && 'ml-2 w-[88%]',
              depth === 2 && 'ml-4 w-[78%]'
            )}
          />
        );
      })}
    </div>
  );
}

function DocsNavPanel({
  docs,
  onItemClick,
}: {
  docs: Array<{ meta: ContentMeta; slug: string }>;
  onItemClick?: () => void;
}) {
  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (!onItemClick) return;
        if ((e.target as HTMLElement).closest('a')) onItemClick();
      }}
    >
      <Suspense fallback={<DocsNavFallback />}>
        <DocsFileTreeNav docs={docs} />
      </Suspense>
    </div>
  );
}

export default function DocsLayout({ children, docs }: DocsLayoutProps) {
  const { isMobile } = useSidebar();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarScrolling, setSidebarScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleSidebarScroll = () => {
    setSidebarScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => setSidebarScrolling(false), 750);
  };

  const asideInner = (
    <div className="flex min-h-0 flex-1 flex-col py-2">
      <div
        className={cn(
          'sidebar-scroll-area min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-0.5',
          sidebarScrolling && 'scroll-active'
        )}
        onScroll={handleSidebarScroll}
      >
        <DocsNavPanel docs={docs} />
      </div>
    </div>
  );

  return (
    <TooltipProvider delay={300}>
      <div className="min-h-screen bg-dark">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-4 top-20 z-50 rounded-lg border border-border bg-dark-elevated p-2 text-gray-300 shadow-lg lg:hidden"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={`
          fixed top-0 left-0 z-40 h-screen w-72 max-w-[88vw] border-r border-border bg-dark-alt
          sidebar-scroll-area overflow-y-auto transition-transform duration-300 lg:hidden
          ${sidebarScrolling ? 'scroll-active' : ''}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
          onScroll={handleSidebarScroll}
        >
          <div className="p-4 pt-24">
            <DocsNavPanel docs={docs} onItemClick={() => setSidebarOpen(false)} />
          </div>
        </aside>

        <main className="min-w-0">
          {/*
          Desktop: fixed-width file-tree column + article (no resize handle).
          Mobile: article only; tree lives in the fixed drawer above.
        */}
          <div className="flex w-full items-start gap-3 px-3 pb-10 pt-0 sm:px-4 lg:gap-6 lg:pl-1.5 lg:pr-8">
            {!isMobile ? (
              <>
                <aside
                  className={cn(
                    'flex w-60 shrink-0 flex-col overflow-hidden border-r border-border',
                    'lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-4rem)]'
                  )}
                >
                  {asideInner}
                </aside>
                <div className="min-w-0 flex-1 max-w-7xl">{children}</div>
              </>
            ) : (
              <div className="min-w-0 flex-1 max-w-7xl">{children}</div>
            )}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
