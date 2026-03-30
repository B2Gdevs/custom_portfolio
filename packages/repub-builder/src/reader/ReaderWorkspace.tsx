'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react';
import {
  ArrowLeft,
  BookOpen,
  Download,
  LibraryBig,
  Menu,
  RotateCcw,
  Search,
  Upload,
} from 'lucide-react';
import EpubViewer from './EpubViewerLazy';
import { ReaderPlanningStrip } from './ReaderPlanningStrip';
import { ReaderShelfCard } from './ReaderShelfCard';
import { ReaderModalRoot } from './ReaderModalRoot';
import { ReaderWorkspaceSidebar, type ReaderShellNavLink } from './ReaderWorkspaceSidebar';
import { defaultReaderLink } from './default-reader-link';
import { readerChromeClasses as readerChrome } from './reader-chrome-theme';
import {
  applyShelfCatalogFilter,
  collectDistinctGenres,
  normalizeShelfCatalogFilter,
  partitionShelfBooks,
  READER_SHELF_FILTER_STORAGE_KEY,
  type ShelfCatalogFilter,
} from './reader-shelf-catalog';
import {
  EPUB_LOCATION_STORAGE_PREFIX,
  readStoredReaderProgress,
  resolveReaderShelfStatus,
} from './reader-progress';
import { readerAppHref } from './reader-routes';
import {
  resolveReaderWorkspaceState,
  type UploadedBookSource,
} from './reader-workspace-state';
import type {
  ReaderBookEntry,
  ReaderPlanningCockpitPayload,
  ReaderLinkComponent,
  ReaderPlanningStripConfig,
} from './types';
import { Input } from '@/components/ui/input';

export type ReaderWorkspaceProps = {
  books: ReaderBookEntry[];
  initialBook?: ReaderBookEntry;
  initialAt?: string;
  initialCfi?: string;
  /** Mounted reader route path (default `/apps/reader`). */
  readerAppPath?: string;
  builtInEpubHref?: (slug: string) => string;
  ReaderLink?: ReaderLinkComponent;
  getPlanningStripConfig?: (bookSlug: string | undefined) => ReaderPlanningStripConfig | null;
  renderPlanningCockpit?: (
    payload: ReaderPlanningCockpitPayload,
    onClose: () => void,
    epubPlanning?: { buffer: ArrayBuffer; bookSlug: string } | null,
  ) => ReactNode;
  repoPlannerAppHref?: string;
  /** Shown at the start of the reader toolbar (optional host chrome). */
  readerToolbarStart?: ReactNode;
  /** Optional links below Library when the host wants global nav in the rail (default: none). */
  readerShellNavLinks?: ReaderShellNavLink[];
};

const READER_NAV_EXPANDED_KEY = 'reader-workspace-nav-expanded';

function slugifyFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function formatUploadedTitle(fileName: string) {
  const baseName = fileName.replace(/\.epub$/i, '').trim();
  const cleaned = baseName.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || 'Uploaded EPUB';
}

function shelfMatches(book: ReaderBookEntry, q: string) {
  if (!q) return true;
  const genreHay = (book.genres ?? []).join(' ');
  const hay =
    `${book.title} ${book.slug} ${book.author ?? ''} ${book.description ?? ''} ${genreHay}`.toLowerCase();
  return hay.includes(q);
}

type ReaderProgressMap = Record<string, number | null>;

function loadProgressMap(books: ReaderBookEntry[]): ReaderProgressMap {
  if (typeof window === 'undefined') return {};

  return books.reduce<ReaderProgressMap>((acc, entry) => {
    acc[entry.slug] = readStoredReaderProgress(entry.slug);
    return acc;
  }, {});
}

function hasSavedLocation(storageKey: string) {
  if (typeof window === 'undefined') return false;

  try {
    return Boolean(window.localStorage.getItem(EPUB_LOCATION_STORAGE_PREFIX + storageKey));
  } catch {
    return false;
  }
}

export default function ReaderWorkspace({
  books,
  initialBook,
  initialAt,
  initialCfi,
  readerAppPath = '/apps/reader',
  builtInEpubHref,
  ReaderLink = defaultReaderLink,
  getPlanningStripConfig,
  renderPlanningCockpit,
  repoPlannerAppHref = '/apps/repo-planner',
  readerToolbarStart,
  readerShellNavLinks,
}: ReaderWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedBook, setUploadedBook] = useState<UploadedBookSource | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [planningStripOpen, setPlanningStripOpen] = useState(false);
  const [progressByBook, setProgressByBook] = useState<ReaderProgressMap>({});
  const [shelfQuery, setShelfQuery] = useState('');
  const [libraryDragActive, setLibraryDragActive] = useState(false);
  const [shelfCatalogFilter, setShelfCatalogFilter] = useState<ShelfCatalogFilter>('all');
  const [prefsHydrated, setPrefsHydrated] = useState(false);
  const [epubPlanningForCockpit, setEpubPlanningForCockpit] = useState<{
    buffer: ArrayBuffer;
    bookSlug: string;
  } | null>(null);
  const [readerNavExpanded, setReaderNavExpanded] = useState(true);
  const [readerNavHydrated, setReaderNavHydrated] = useState(false);
  const [readerMobileNavOpen, setReaderMobileNavOpen] = useState(false);
  const shelfFilterInitRef = useRef(false);

  useEffect(() => {
    try {
      const rawNav = localStorage.getItem(READER_NAV_EXPANDED_KEY);
      if (rawNav === 'false') setReaderNavExpanded(false);
      else if (rawNav === 'true') setReaderNavExpanded(true);
    } catch {
      /* ignore */
    }
    setReaderNavHydrated(true);
  }, []);

  useEffect(() => {
    if (!readerNavHydrated) return;
    try {
      localStorage.setItem(READER_NAV_EXPANDED_KEY, String(readerNavExpanded));
    } catch {
      /* ignore */
    }
  }, [readerNavExpanded, readerNavHydrated]);

  const catalogGenres = useMemo(() => collectDistinctGenres(books), [books]);

  useEffect(() => {
    if (!shelfFilterInitRef.current) {
      shelfFilterInitRef.current = true;
      try {
        const rawF = localStorage.getItem(READER_SHELF_FILTER_STORAGE_KEY);
        setShelfCatalogFilter(normalizeShelfCatalogFilter(rawF, catalogGenres));
      } catch {
        /* ignore */
      }
      setPrefsHydrated(true);
      return;
    }
    setShelfCatalogFilter((prev) =>
      prev !== 'all' && !catalogGenres.includes(prev) ? 'all' : prev,
    );
  }, [catalogGenres]);

  useEffect(() => {
    if (!prefsHydrated) return;
    try {
      localStorage.setItem(READER_SHELF_FILTER_STORAGE_KEY, shelfCatalogFilter);
    } catch {
      /* ignore */
    }
  }, [prefsHydrated, shelfCatalogFilter]);

  useEffect(() => {
    const sync = () => setProgressByBook(loadProgressMap(books));

    sync();
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('focus', sync);
      window.removeEventListener('storage', sync);
    };
  }, [books]);

  const workspaceOptions = useMemo(
    () => (builtInEpubHref ? { builtInEpubHref } : undefined),
    [builtInEpubHref],
  );

  const workspaceState = useMemo(
    () => resolveReaderWorkspaceState({ initialBook, uploadedBook }, workspaceOptions),
    [initialBook, uploadedBook, workspaceOptions],
  );
  const activeTitle = workspaceState.title;
  const activeKicker = workspaceState.kicker;
  const hasBuiltInBook = workspaceState.mode === 'built-in-reading' || workspaceState.canDownload;
  const isLibraryView = workspaceState.mode === 'library';
  const downloadHref =
    workspaceState.bookSlug && workspaceState.canDownload
      ? builtInEpubHref?.(workspaceState.bookSlug) ?? `/books/${workspaceState.bookSlug}/book.epub`
      : null;
  const downloadName =
    workspaceState.bookSlug && workspaceState.canDownload ? `${workspaceState.bookSlug}.epub` : null;

  const deeplinkLocation = useMemo(() => {
    const cfi = initialCfi?.trim();
    if (cfi) return cfi;
    const at = initialAt?.trim();
    if (at) return at;
    return undefined;
  }, [initialAt, initialCfi]);

  const viewerSource = workspaceState.viewerSource;

  useEffect(() => {
    if (viewerSource?.kind !== 'built-in') {
      setEpubPlanningForCockpit(null);
      return;
    }
    setEpubPlanningForCockpit(null);
  }, [viewerSource?.kind, viewerSource?.storageKey]);

  const { builtIn: builtInBooks, queued: queuedBooks } = useMemo(() => partitionShelfBooks(books), [books]);

  const shelfGenreChips = useMemo(
    () => [{ id: 'all' as const, label: 'All' }, ...catalogGenres.map((g) => ({ id: g, label: g }))],
    [catalogGenres],
  );

  const { builtIn: typeBuiltIn, queued: typeQueued } = useMemo(
    () => applyShelfCatalogFilter(builtInBooks, queuedBooks, shelfCatalogFilter),
    [builtInBooks, queuedBooks, shelfCatalogFilter],
  );

  const shelfQ = shelfQuery.trim().toLowerCase();
  const filteredBuiltIn = useMemo(
    () => typeBuiltIn.filter((b) => shelfMatches(b, shelfQ)),
    [typeBuiltIn, shelfQ],
  );
  const filteredQueued = useMemo(
    () => typeQueued.filter((b) => shelfMatches(b, shelfQ)),
    [typeQueued, shelfQ],
  );

  const shelfSummary = useMemo(() => {
    const n = filteredBuiltIn.length + filteredQueued.length;
    if (shelfQ) {
      return `${n} match${n === 1 ? '' : 'es'}`;
    }
    if (shelfCatalogFilter !== 'all') {
      return `${n} title${n === 1 ? '' : 's'} tagged “${shelfCatalogFilter}”`;
    }
    return `${builtInBooks.length} available now, ${queuedBooks.length} queued behind manuscript and build work.`;
  }, [
    builtInBooks.length,
    filteredBuiltIn.length,
    filteredQueued.length,
    queuedBooks.length,
    shelfCatalogFilter,
    shelfQ,
  ]);

  const planningConfig = getPlanningStripConfig?.(workspaceState.bookSlug ?? undefined) ?? null;

  const t = readerChrome;

  const ingestEpubFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.epub')) {
      setUploadError('Select an `.epub` file.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const buffer = await file.arrayBuffer();
      const storageKey = `uploaded-epub-${slugifyFileName(file.name) || 'book'}`;
      setUploadedBook({
        buffer,
        fileName: file.name,
        storageKey,
        title: formatUploadedTitle(file.name),
      });
    } catch {
      setUploadError('That EPUB could not be opened.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    await ingestEpubFile(file);
  };

  const onLibraryDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
      setLibraryDragActive(true);
    }
  };

  const onLibraryDragLeave = (e: DragEvent) => {
    e.preventDefault();
    const related = e.relatedTarget as Node | null;
    if (!related || !e.currentTarget.contains(related)) {
      setLibraryDragActive(false);
    }
  };

  const onLibraryDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLibraryDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await ingestEpubFile(file);
  };

  const Link = ReaderLink;

  const catalogTotal = builtInBooks.length + queuedBooks.length;
  const emptyShelfMessage =
    catalogTotal === 0
      ? 'No books in the catalog yet.'
      : shelfQ || shelfCatalogFilter !== 'all'
        ? 'No books match this filter or search.'
        : 'No books match your search.';

  return (
    <div data-reader-workspace className={`flex h-full min-h-0 flex-col ${t.shell}`}>
      <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
        <ReaderWorkspaceSidebar
          readerAppPath={readerAppPath}
          isLibraryView={isLibraryView}
          activeTitle={activeTitle}
          ReaderLink={ReaderLink}
          expanded={readerNavExpanded}
          onToggleExpanded={() => setReaderNavExpanded((v) => !v)}
          extraLinks={readerShellNavLinks}
          mobileOpen={readerMobileNavOpen}
          onMobileClose={() => setReaderMobileNavOpen(false)}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className={`shrink-0 border-b ${t.headerBar}`}>
            <div className="mx-auto flex max-w-[120rem] flex-wrap items-end justify-between gap-x-3 gap-y-2 px-4 pb-0 pt-2.5 md:px-5">
              <div className="flex min-w-0 flex-1 flex-wrap items-end gap-x-3 gap-y-2">
                <div className="flex min-w-0 items-center gap-2.5 pb-2">
                  <button
                    type="button"
                    onClick={() => setReaderMobileNavOpen(true)}
                    className={`inline-flex shrink-0 items-center justify-center rounded-lg border p-2 md:hidden ${t.pillButton}`}
                    aria-label="Open reader menu"
                  >
                    <Menu size={18} aria-hidden />
                  </button>
                  {readerToolbarStart ? (
                    <span className="flex shrink-0 items-center self-center pb-0.5">{readerToolbarStart}</span>
                  ) : null}
                  {!isLibraryView ? (
                    <Link
                      href={readerAppHref(readerAppPath)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${t.pillButton}`}
                    >
                      <ArrowLeft size={15} />
                      Library
                    </Link>
                  ) : null}
                  <div className="min-w-0">
                    <p className="section-kicker">{activeKicker}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      {isLibraryView ? (
                        <LibraryBig size={16} className={`shrink-0 ${t.iconAccent}`} />
                      ) : (
                        <BookOpen size={16} className={`shrink-0 ${t.iconAccent}`} />
                      )}
                      <h1
                        className={`truncate font-display text-[1.8rem] leading-none md:text-[2rem] ${t.title}`}
                      >
                        {activeTitle}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".epub,application/epub+zip"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handleOpenFilePicker}
                  disabled={isUploading}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${t.pillButton}`}
                >
                  <Upload size={15} aria-hidden />
                  {isUploading ? 'Importing…' : 'Import EPUB'}
                </button>
                {uploadedBook && hasBuiltInBook ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedBook(null);
                      setUploadError(null);
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${t.pillButton}`}
                  >
                    <RotateCcw size={15} />
                    Return to Library Book
                  </button>
                ) : null}
                {!uploadedBook && hasBuiltInBook ? (
                  <a
                    href={downloadHref ?? undefined}
                    download={downloadName ?? undefined}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${t.pillButton}`}
                  >
                    <Download size={15} />
                    Download EPUB
                  </a>
                ) : null}
              </div>
            </div>
            {uploadError ? (
              <div className="mx-auto max-w-[120rem] px-4 pb-2 md:px-5">
                <p className="text-sm text-destructive">{uploadError}</p>
              </div>
            ) : null}
            {workspaceState.mode === 'local-reading' && workspaceState.localFileName ? (
              <div className="mx-auto max-w-[120rem] px-4 pb-2 md:px-5">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Reading local file: {workspaceState.localFileName}
                </p>
              </div>
            ) : null}
            {isLibraryView ? (
              <div className="mx-auto max-w-[120rem] px-4 pb-2 md:px-5">
                <p className="text-xs text-muted-foreground">
                  Imported EPUBs stay local in this browser until you explicitly upload them.
                </p>
              </div>
            ) : null}
          </div>
          <ReaderPlanningStrip
            config={planningConfig}
            open={planningStripOpen}
            onToggle={() => setPlanningStripOpen((v) => !v)}
            ReaderLink={ReaderLink}
          />
          <div className="min-h-0 flex-1 px-3 pb-3 pt-3 md:px-4 md:pb-4">
            <div className={`mx-auto h-full max-w-[120rem] overflow-hidden rounded-[2rem] border ${t.inset}`}>
              {viewerSource ? (
                <EpubViewer
                  key={deeplinkLocation ? `dl:${deeplinkLocation}` : `sk:${viewerSource.storageKey}`}
                  epubUrl={viewerSource.kind === 'built-in' ? viewerSource.epubUrl : undefined}
                  epubData={viewerSource.kind === 'local' ? viewerSource.epubData : undefined}
                  storageKey={viewerSource.storageKey}
                  initialLocation={deeplinkLocation}
                  className="h-full"
                  layoutMode="reader"
                />
              ) : (
                <div
                  className={`h-full overflow-auto px-5 py-6 transition-shadow md:px-7 md:py-8 ${libraryDragActive ? `ring-2 ring-inset ${t.libraryDragRing}` : ''
                    }`}
                  onDragOver={onLibraryDragOver}
                  onDragLeave={onLibraryDragLeave}
                  onDrop={onLibraryDrop}
                >
                  <div className="mx-auto max-w-[112rem] space-y-6">
                    <section className="space-y-4">
                      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                        <div className="relative">
                          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="bg-background pl-9"
                            id="search-input"
                            placeholder="Search..."
                            type="search"
                            value={shelfQuery}
                            onChange={(e) => setShelfQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      <div
                        className="flex flex-wrap gap-2"
                        role="group"
                        aria-label="Filter catalog by genre"
                      >
                        {shelfGenreChips.map((f) => {
                          const active = shelfCatalogFilter === f.id;
                          const isAll = f.id === 'all';
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setShelfCatalogFilter(f.id)}
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${isAll ? 'uppercase tracking-[0.14em]' : 'tracking-normal'
                                } ${active ? t.chipActive : t.chip}`}
                              aria-pressed={active}
                            >
                              {f.label}
                            </button>
                          );
                        })}
                      </div>

                      {filteredBuiltIn.length === 0 && filteredQueued.length === 0 ? (
                        <p className={`rounded-2xl border border-dashed px-4 py-8 text-center text-sm ${t.emptyState}`}>
                          {emptyShelfMessage}
                        </p>
                      ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                          {filteredBuiltIn.map((book) => {
                            const storedProgress = progressByBook[book.slug] ?? null;
                            const status = resolveReaderShelfStatus(book.hasEpub, storedProgress);
                            const isActive = hasSavedLocation(book.slug);

                            return (
                              <ReaderShelfCard
                                key={book.slug}
                                book={book}
                                status={status}
                                isActive={isActive}
                                readerHref={readerAppHref(readerAppPath, { book: book.slug })}
                                ReaderLink={ReaderLink}
                                planningCockpitPayload={
                                  book.hasEpub ? getPlanningStripConfig?.(book.slug)?.cockpitPayload : undefined
                                }
                              />
                            );
                          })}
                          {filteredQueued.map((book) => (
                            <ReaderShelfCard
                              key={book.slug}
                              book={book}
                              status={resolveReaderShelfStatus(false, null)}
                              isActive={false}
                              readerHref={readerAppHref(readerAppPath, { book: book.slug })}
                              ReaderLink={ReaderLink}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ReaderModalRoot
        renderPlanningCockpit={renderPlanningCockpit}
        epubPlanningContext={epubPlanningForCockpit}
        repoPlannerAppHref={repoPlannerAppHref}
      />
    </div>
  );
}
