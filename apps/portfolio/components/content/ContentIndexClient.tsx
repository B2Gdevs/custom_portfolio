'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowUpRight,
  BookText,
  CalendarDays,
  Filter,
  FolderKanban,
  Search,
  Sparkles,
} from 'lucide-react';
import type { DiscoveryFilters, DiscoveryItem, DiscoveryKind, DiscoveryLink } from '@/lib/content-discovery';
import {
  buildDiscoverySnippet,
  filterDiscoveryItems,
  getDefaultSort,
  getDiscoveryFilterOptions,
} from '@/lib/content-discovery';
import { HighlightedText } from '@/components/content/HighlightedText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CONTENT_SEARCH_MODAL_ID } from '@/lib/modal-ids';
import { useModalStore } from '@/stores/modalStore';
import { cn } from '@/lib/utils';

type SortOption = {
  value: string;
  label: string;
};

type IdentityConfig = {
  railLabel: string;
  railTitle: string;
  railDescription: string;
  headerLabel: string;
  emptyHint: string;
  searchPlaceholder: string;
  resultsNoun: string;
  activeBadgeLabel: string;
  accentClass: string;
  panelClass: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const IDENTITY: Record<DiscoveryKind, IdentityConfig> = {
  blog: {
    railLabel: 'Field Notes',
    railTitle: 'Blog Archive',
    railDescription: 'Essays, build notes, and workshop posts with a strong, repeatable reading rhythm.',
    headerLabel: 'Archive',
    emptyHint: 'Adjust the keyword, clear a filter, or reopen the blog command palette with Cmd+K.',
    searchPlaceholder: 'Search posts, topics, and section headings...',
    resultsNoun: 'posts',
    activeBadgeLabel: 'Blog',
    accentClass: 'text-[#d6a379]',
    panelClass: 'bg-[radial-gradient(circle_at_top_left,rgba(214,163,121,0.16),transparent_45%),rgba(26,21,18,0.88)]',
    icon: BookText,
  },
  projects: {
    railLabel: 'Proof',
    railTitle: 'Project Showcase',
    railDescription: 'Products, prototypes, and implementation writeups with featured-first ordering and quick link access.',
    headerLabel: 'Proof of Work',
    emptyHint: 'Adjust the keyword, clear a filter, or reopen the projects command palette with Cmd+K.',
    searchPlaceholder: 'Search projects, implementation notes, and outcomes...',
    resultsNoun: 'projects',
    activeBadgeLabel: 'Project',
    accentClass: 'text-[#a8c98b]',
    panelClass: 'bg-[radial-gradient(circle_at_top_left,rgba(133,175,111,0.16),transparent_45%),rgba(22,27,20,0.88)]',
    icon: Sparkles,
  },
  listen: {
    railLabel: 'Listen',
    railTitle: 'Listening Room',
    railDescription: 'Tracks, presets, and listening notes with quick filtering and direct playback links.',
    headerLabel: 'Listen',
    emptyHint: 'Adjust the keyword, clear a filter, or reopen the listening room command palette with Cmd+K.',
    searchPlaceholder: 'Search tracks, presets, moods, and keywords...',
    resultsNoun: 'rows',
    activeBadgeLabel: 'Listen',
    accentClass: 'text-[#91b7d8]',
    panelClass: 'bg-[radial-gradient(circle_at_top_left,rgba(103,147,186,0.18),transparent_45%),rgba(19,23,29,0.88)]',
    icon: Sparkles,
  },
};

function DiscoveryTagButton({
  active,
  onClick,
  children,
  accentClass,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  accentClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm transition',
        active
          ? `border-accent/70 bg-accent/15 ${accentClass}`
          : 'border-border/70 bg-dark-alt/60 text-text-muted hover:border-border hover:text-primary'
      )}
    >
      {children}
    </button>
  );
}

function CompactLink({ link }: { link: DiscoveryLink }) {
  const className =
    'inline-flex items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 text-xs text-text-muted transition hover:border-accent/60 hover:text-primary';

  if (link.external) {
    return (
      <a href={link.href} className={className} target="_blank" rel="noreferrer noopener">
        <span>{link.label}</span>
        <ArrowUpRight size={12} />
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      <span>{link.label}</span>
    </Link>
  );
}

function DiscoveryFilterPanel({
  kind,
  items,
  filters,
  setFilters,
}: {
  kind: DiscoveryKind;
  items: DiscoveryItem[];
  filters: DiscoveryFilters;
  setFilters: Dispatch<SetStateAction<DiscoveryFilters>>;
}) {
  const options = getDiscoveryFilterOptions(items);
  const identity = IDENTITY[kind];
  const sortOptions: SortOption[] =
    kind === 'projects'
      ? [
          { value: 'featured', label: 'Featured' },
          { value: 'newest', label: 'Newest' },
          { value: 'title', label: 'Title' },
        ]
      : [
          { value: 'newest', label: 'Newest' },
          { value: 'oldest', label: 'Oldest' },
          { value: 'title', label: 'Title' },
        ];

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Sort</p>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <DiscoveryTagButton
              key={option.value}
              active={(filters.sort ?? getDefaultSort(kind)) === option.value}
              onClick={() => setFilters((current) => ({ ...current, sort: option.value }))}
              accentClass={identity.accentClass}
            >
              {option.label}
            </DiscoveryTagButton>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Tags</p>
        <div className="flex flex-wrap gap-2">
          {options.tags.map((tag) => {
            const active = (filters.tags ?? []).includes(tag);
            return (
              <DiscoveryTagButton
                key={tag}
                active={active}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    tags: active
                      ? (current.tags ?? []).filter((value) => value !== tag)
                      : [...(current.tags ?? []), tag],
                  }))
                }
                accentClass={identity.accentClass}
              >
                {tag}
              </DiscoveryTagButton>
            );
          })}
        </div>
      </section>

      {kind === 'blog' ? (
        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Year</p>
          <div className="flex flex-wrap gap-2">
            <DiscoveryTagButton
              active={!filters.year}
              onClick={() => setFilters((current) => ({ ...current, year: null }))}
              accentClass={identity.accentClass}
            >
              All
            </DiscoveryTagButton>
            {options.years.map((year) => (
              <DiscoveryTagButton
                key={year}
                active={filters.year === year}
                onClick={() => setFilters((current) => ({ ...current, year }))}
                accentClass={identity.accentClass}
              >
                {year}
              </DiscoveryTagButton>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Status</p>
          <div className="flex flex-wrap gap-2">
            <DiscoveryTagButton
              active={!filters.status}
              onClick={() => setFilters((current) => ({ ...current, status: null }))}
              accentClass={identity.accentClass}
            >
              All
            </DiscoveryTagButton>
            {options.statuses.map((status) => (
              <DiscoveryTagButton
                key={status}
                active={filters.status === status}
                onClick={() => setFilters((current) => ({ ...current, status }))}
                accentClass={identity.accentClass}
              >
                {status}
              </DiscoveryTagButton>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function ContentIndexClient({
  kind,
  title,
  description,
  items,
}: {
  kind: DiscoveryKind;
  title: string;
  description: string;
  items: DiscoveryItem[];
}) {
  const openModal = useModalStore((state) => state.openModal);
  const [filters, setFilters] = useState<DiscoveryFilters>({
    query: '',
    tags: [],
    year: null,
    status: null,
    sort: getDefaultSort(kind),
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const identity = IDENTITY[kind];
  const IdentityIcon = identity.icon;

  const results = filterDiscoveryItems(items, filters);

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:px-8">
      <aside
        className={cn(
          'sticky top-24 hidden h-fit w-72 shrink-0 rounded-[2rem] border border-border/70 p-5 lg:block',
          identity.panelClass
        )}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15">
            <IdentityIcon size={20} className={identity.accentClass} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">{identity.railLabel}</p>
            <h2 className="mt-1 font-serif text-2xl text-primary">{identity.railTitle}</h2>
          </div>
        </div>
        <p className="mt-3 text-sm text-text-muted">{identity.railDescription}</p>
        <div className="mt-6">
          <DiscoveryFilterPanel kind={kind} items={items} filters={filters} setFilters={setFilters} />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'rounded-[2rem] border border-border/70 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.16)]',
            identity.panelClass
          )}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15">
                  <IdentityIcon size={20} className={identity.accentClass} />
                </span>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">{identity.headerLabel}</p>
              </div>
              <h1 className="mt-3 font-serif text-4xl text-primary sm:text-5xl">{title}</h1>
              <p className="mt-3 text-base text-text-muted sm:text-lg">{description}</p>
            </div>
            <div className="flex gap-3 lg:w-[26rem]">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <Input
                  value={filters.query ?? ''}
                  onChange={(event) => setFilters((current) => ({ ...current, query: event.currentTarget.value }))}
                  placeholder={identity.searchPlaceholder}
                  className="h-11 rounded-2xl border-border/80 bg-dark px-10"
                  aria-label={`Search ${kind}`}
                />
              </div>
              <Button
                variant="outline"
                className="h-11 rounded-2xl lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <Filter size={16} />
                Filters
              </Button>
              <Button
                variant="outline"
                className="hidden h-11 rounded-2xl xl:inline-flex"
                onClick={() => openModal(CONTENT_SEARCH_MODAL_ID, { initialQuery: filters.query ?? '' })}
              >
                Cmd+K
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <span>
              {results.length} {identity.resultsNoun}
            </span>
            {(filters.tags?.length ?? 0) > 0 ? <span>· {filters.tags?.length} tag filters</span> : null}
            {filters.year ? <span>· {filters.year}</span> : null}
            {filters.status ? <span>· {filters.status}</span> : null}
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {results.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-border/70 bg-dark-alt/40 p-10 text-center">
              <p className="font-serif text-2xl text-primary">No matches yet</p>
              <p className="mt-2 text-sm text-text-muted">{identity.emptyHint}</p>
            </div>
          ) : (
            results.map((item) => {
              const snippet = buildDiscoverySnippet(item, filters.query ?? '');
              const itemDate = item.updated ?? item.date;
              const topLinks = [...item.appLinks, ...item.downloads, ...item.links].slice(0, 3);

              return (
                <article
                  key={`${item.kind}-${item.slug}`}
                  className="rounded-[2rem] border border-border/70 bg-dark-alt/55 p-6 transition hover:border-accent/50 hover:bg-dark-alt/75"
                >
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      {item.kind === 'projects' ? <FolderKanban size={14} /> : <CalendarDays size={14} />}
                      {identity.activeBadgeLabel}
                    </span>
                    {item.status ? <span>{item.status}</span> : null}
                    {item.year ? <span>{item.year}</span> : null}
                  </div>

                  <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <Link href={item.href} className="group">
                        <h2 className="font-serif text-3xl text-primary transition group-hover:text-accent">
                          <HighlightedText text={item.title} query={filters.query ?? ''} />
                        </h2>
                      </Link>
                      {itemDate ? (
                        <p className="mt-2 text-sm text-text-muted">
                          {format(new Date(itemDate), 'MMMM d, yyyy')}
                        </p>
                      ) : null}
                      {item.description ? (
                        <p className="mt-3 text-base text-text-muted">
                          <HighlightedText text={item.description} query={filters.query ?? ''} />
                        </p>
                      ) : null}
                      {snippet ? (
                        <p className="mt-4 text-sm leading-7 text-text-muted">
                          <HighlightedText text={snippet} query={filters.query ?? ''} />
                        </p>
                      ) : null}
                    </div>
                    <div className="lg:ml-6 lg:w-56">
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/10 px-4 py-2 text-sm text-primary transition hover:bg-accent/20"
                      >
                        Open
                        <ArrowUpRight size={16} />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={`${item.slug}-${tag}`}
                        className="rounded-full border border-border/70 px-3 py-1 text-xs text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {topLinks.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {topLinks.map((link) => (
                        <CompactLink key={`${item.slug}-${link.label}-${link.href}`} link={link} />
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="right" className="border-border bg-[#171412] text-primary">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine the {kind === 'blog' ? 'blog archive' : 'projects showcase'} on mobile.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <DiscoveryFilterPanel kind={kind} items={items} filters={filters} setFilters={setFilters} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
