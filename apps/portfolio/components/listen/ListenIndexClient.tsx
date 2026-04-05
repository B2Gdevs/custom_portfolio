'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Filter, Headphones, Lock, Radio, Search, SlidersHorizontal, Waves } from 'lucide-react';
import type { DiscoveryFilters, DiscoveryItem } from '@/lib/content-discovery';
import {
  buildDiscoverySnippet,
  filterDiscoveryItems,
  getDefaultSort,
  getDiscoveryFilterOptions,
} from '@/lib/content-discovery';
import { DiscoveryTagButton } from '@/components/content/DiscoveryTagButton';
import {
  DiscoveryHeroPanel,
  DiscoveryIndexLayout,
  LISTEN_DISCOVERY_PANEL_CLASS,
} from '@/components/content/DiscoveryIndexLayout';
import { HighlightedText } from '@/components/content/HighlightedText';
import { BandLabListenEmbed } from '@/components/listen/BandLabListenEmbed';
import { ListenUnlockForm } from '@/components/listen/ListenUnlockForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CONTENT_SEARCH_MODAL_ID } from '@/lib/modal-ids';
import type { ListenPageRow } from '@/lib/listen-items';
import { listenPresetCardBorderAccent } from '@/lib/listen-card-accent';
import { useModalStore } from '@/stores/modalStore';
import { cn } from '@/lib/utils';

const bandlabCtaClassName =
  'inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/10 px-4 py-2 text-sm text-primary transition hover:bg-accent/20';

type SortOption = { value: string; label: string };

function ListenFilterPanel({
  items,
  filters,
  setFilters,
}: {
  items: DiscoveryItem[];
  filters: DiscoveryFilters;
  setFilters: Dispatch<SetStateAction<DiscoveryFilters>>;
}) {
  const options = getDiscoveryFilterOptions(items);
  const sortOptions: SortOption[] = [
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
              active={(filters.sort ?? getDefaultSort('listen')) === option.value}
              onClick={() => setFilters((current) => ({ ...current, sort: option.value }))}
            >
              {option.label}
            </DiscoveryTagButton>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Type</p>
        <div className="flex flex-wrap gap-2">
          <DiscoveryTagButton
            active={!filters.listenCatalogKind}
            onClick={() => setFilters((current) => ({ ...current, listenCatalogKind: null }))}
          >
            All
          </DiscoveryTagButton>
          {options.listenKinds.map((kind) => (
            <DiscoveryTagButton
              key={kind}
              active={filters.listenCatalogKind === kind}
              onClick={() => setFilters((current) => ({ ...current, listenCatalogKind: kind }))}
            >
              {kind === 'preset' ? 'Presets' : 'Tracks'}
            </DiscoveryTagButton>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Genre</p>
        <div className="flex flex-wrap gap-2">
          <DiscoveryTagButton
            active={!filters.genre}
            onClick={() => setFilters((current) => ({ ...current, genre: null }))}
          >
            All
          </DiscoveryTagButton>
          {options.genres.map((genre) => (
            <DiscoveryTagButton
              key={genre}
              active={filters.genre === genre}
              onClick={() => setFilters((current) => ({ ...current, genre }))}
            >
              {genre}
            </DiscoveryTagButton>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Mood</p>
        <div className="flex flex-wrap gap-2">
          <DiscoveryTagButton
            active={!filters.mood}
            onClick={() => setFilters((current) => ({ ...current, mood: null }))}
          >
            All
          </DiscoveryTagButton>
          {options.moods.map((mood) => (
            <DiscoveryTagButton
              key={mood}
              active={filters.mood === mood}
              onClick={() => setFilters((current) => ({ ...current, mood }))}
            >
              {mood}
            </DiscoveryTagButton>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Era / note</p>
        <div className="flex flex-wrap gap-2">
          <DiscoveryTagButton
            active={!filters.era}
            onClick={() => setFilters((current) => ({ ...current, era: null }))}
          >
            All
          </DiscoveryTagButton>
          {options.eras.map((era) => (
            <DiscoveryTagButton
              key={era}
              active={filters.era === era}
              onClick={() => setFilters((current) => ({ ...current, era }))}
            >
              {era}
            </DiscoveryTagButton>
          ))}
        </div>
      </section>

      {options.tags.length > 0 ? (
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
                >
                  {tag}
                </DiscoveryTagButton>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function ListenIndexClient({ rows }: { rows: ListenPageRow[] }) {
  const openModal = useModalStore((state) => state.openModal);
  const [filters, setFilters] = useState<DiscoveryFilters>({
    query: '',
    tags: [],
    year: null,
    status: null,
    genre: null,
    mood: null,
    era: null,
    listenCatalogKind: null,
    sort: getDefaultSort('listen'),
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const items = useMemo(() => rows.map((row) => row.item), [rows]);
  const rowBySlug = useMemo(() => new Map(rows.map((row) => [row.item.slug, row])), [rows]);

  const results = useMemo(() => {
    const filtered = filterDiscoveryItems(items, filters);
    return filtered.map((item) => rowBySlug.get(item.slug)).filter(Boolean) as ListenPageRow[];
  }, [items, filters, rowBySlug]);

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
    if (!hash) return;
    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results]);

  return (
    <>
      <DiscoveryIndexLayout
        asidePanelClassName={LISTEN_DISCOVERY_PANEL_CLASS}
        aside={
          <>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15">
                <Waves size={20} className="text-[#91b7d8]" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Signal</p>
                <h2 className="mt-1 font-serif text-2xl text-primary">Listening Room</h2>
              </div>
            </div>
            <p className="mt-3 text-sm text-text-muted">
              Filter tracks and BandLab presets by type, mood, genre, and release context.
            </p>
            <div className="mt-6">
              <ListenFilterPanel items={items} filters={filters} setFilters={setFilters} />
            </div>
          </>
        }
      >
        <>
          <DiscoveryHeroPanel
            panelClassName={LISTEN_DISCOVERY_PANEL_CLASS}
            top={
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-black/15">
                      <Radio size={20} className="text-[#91b7d8]" />
                    </span>
                    <p className="text-xs uppercase tracking-[0.24em] text-text-muted">Listen</p>
                  </div>
                  <h1 className="mt-3 font-serif text-4xl text-primary sm:text-5xl">Songs in the same weather system</h1>
                  <p className="mt-3 text-base text-text-muted sm:text-lg">
                    Tracks and BandLab presets in one catalog. Public rows stay open, and owner-only media appears only when the signed-in session allows it.
                  </p>
                </div>
                <div className="flex gap-3 lg:w-[26rem]">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <Input
                      value={filters.query ?? ''}
                      onChange={(event) => setFilters((current) => ({ ...current, query: event.currentTarget.value }))}
                      placeholder="Search tracks, presets, moods, and keywords..."
                      className="h-11 rounded-2xl border-border/80 bg-dark px-10"
                      aria-label="Search listen catalog"
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
            }
            metaRow={
              <>
                <span>{results.length} rows</span>
                {filters.listenCatalogKind ? (
                  <span>· {filters.listenCatalogKind === 'preset' ? 'Presets' : 'Tracks'}</span>
                ) : null}
                {filters.genre ? <span>· {filters.genre}</span> : null}
                {filters.mood ? <span>· {filters.mood}</span> : null}
                {filters.era ? <span>· {filters.era}</span> : null}
                {(filters.tags?.length ?? 0) > 0 ? <span>· {filters.tags?.length} tags</span> : null}
              </>
            }
          />

          <div className="mt-8 space-y-5">
          {results.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-border/70 bg-dark-alt/40 p-10 text-center">
              <p className="font-serif text-2xl text-primary">No matches yet</p>
              <p className="mt-2 text-sm text-text-muted">
                Adjust the keyword, clear a filter, or reopen the command palette with Cmd+K.
              </p>
            </div>
          ) : (
            results.map((row) => {
              const { item, locked, lockGroup, embedUrl, bandlabUrl } = row;
              const queryTrimmed = filters.query?.trim() ?? '';
              const snippet = queryTrimmed ? buildDiscoverySnippet(item, filters.query ?? '') : '';
              const itemDate = item.updated ?? item.date;
              const isPreset = item.listenCatalogKind === 'preset';
              const showBandlabLink = !locked && Boolean(bandlabUrl);
              const showHeaderBandlabCta = showBandlabLink && Boolean(embedUrl);
              const showInlineBandlabCta = showBandlabLink && !embedUrl;

              return (
                <article
                  key={item.slug}
                  id={item.slug}
                  className="story-card overflow-hidden scroll-mt-28"
                  style={isPreset ? listenPresetCardBorderAccent(item.slug) : undefined}
                >
                  <div className="border-b border-border/70 p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-[0.72rem] uppercase tracking-[0.3em] text-text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        {isPreset ? <SlidersHorizontal size={14} /> : <Headphones size={14} />}
                        {isPreset ? 'Preset' : 'Track'}
                      </span>
                      {item.era ? (
                        <>
                          <span className="text-accent">•</span>
                          <span>{item.era}</span>
                        </>
                      ) : null}
                      {item.genre ? (
                        <>
                          <span className="text-accent">•</span>
                          <span>{item.genre}</span>
                        </>
                      ) : null}
                      {item.duration ? (
                        <>
                          <span className="text-accent">•</span>
                          <span>{item.duration}</span>
                        </>
                      ) : null}
                      {locked ? (
                        <>
                          <span className="text-accent">•</span>
                          <span className="inline-flex items-center gap-1 text-accent">
                            <Lock size={12} />
                            Gated
                          </span>
                        </>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <h2 className="font-display text-3xl text-primary">
                          <HighlightedText text={item.title} query={filters.query ?? ''} />
                        </h2>
                        {itemDate ? (
                          <p className="mt-2 text-sm text-text-muted">
                            {format(new Date(itemDate), 'MMMM d, yyyy')}
                          </p>
                        ) : null}
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">
                          <HighlightedText text={item.description} query={filters.query ?? ''} />
                        </p>
                        {queryTrimmed && snippet ? (
                          <p className="mt-3 text-sm leading-7 text-text-muted">
                            <HighlightedText text={snippet} query={filters.query ?? ''} />
                          </p>
                        ) : null}
                        {showInlineBandlabCta ? (
                          <a
                            href={bandlabUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(bandlabCtaClassName, 'mt-4 w-full justify-center sm:w-auto')}
                          >
                            Open on BandLab
                          </a>
                        ) : null}
                      </div>
                      {showHeaderBandlabCta ? (
                        <div className="shrink-0 lg:ml-6">
                          <a
                            href={bandlabUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={bandlabCtaClassName}
                          >
                            Open on BandLab
                          </a>
                        </div>
                      ) : null}
                    </div>

                    {locked && lockGroup ? <ListenUnlockForm lockGroup={lockGroup} /> : null}
                  </div>

                  {!locked && embedUrl ? (
                    <BandLabListenEmbed
                      src={embedUrl}
                      title={`${item.title} — BandLab`}
                      variant={isPreset ? 'preset' : 'track'}
                    />
                  ) : null}

                  {showInlineBandlabCta ? (
                    <div className="border-t border-border/60 px-6 py-4 text-sm text-text-muted">
                      No embedded player here; use Open on BandLab to hear it.
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2 px-6 py-4">
                    {item.mood ? <p className="text-sm text-text-muted">{item.mood}</p> : null}
                    {item.tags.map((tag) => (
                      <span
                        key={`${item.slug}-${tag}`}
                        className="rounded-full border border-border/70 px-3 py-1 text-xs text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })
          )}
        </div>
        </>
      </DiscoveryIndexLayout>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="right" className="border-border bg-[#171412] text-primary">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine tracks and presets on mobile.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <ListenFilterPanel items={items} filters={filters} setFilters={setFilters} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
