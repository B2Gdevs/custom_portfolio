'use client';

import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, LoaderCircle, Menu, X } from 'lucide-react';
import { ReactReader, ReactReaderStyle } from 'react-reader';

const STORAGE_PREFIX = 'epub-location-';
const READER_HEADER_H = 52;
const READER_FOOTER_H = 44;
const READER_SPREAD_QUERY = '(min-width: 1200px)';
const LOCATION_GENERATION_CHARS = 1200;

interface ReaderNavItem {
  label: string;
  href: string;
  subitems?: ReaderNavItem[];
}

interface ReaderLocation {
  start?: {
    href?: string;
    cfi?: string;
    displayed?: {
      page: number;
      total: number;
    };
  };
}

interface ReaderRendition {
  book: {
    ready: Promise<void>;
    loaded: {
      navigation: Promise<{
        toc: ReaderNavItem[];
      }>;
    };
    locations: {
      generate: (chars: number) => Promise<Array<string>>;
      length: () => number;
      percentageFromCfi: (cfi: string) => number;
      cfiFromPercentage: (percentage: number) => string;
    };
  };
  flow: (mode: string) => void;
  spread: (mode: string, min?: number) => void;
  themes: {
    register: (name: string, rules: Record<string, Record<string, string>>) => void;
    select: (name: string) => void;
    fontSize: (value: string) => void;
  };
  on: (event: string, listener: (location: ReaderLocation) => void) => void;
  off: (event: string, listener: (location: ReaderLocation) => void) => void;
  prev: () => Promise<void>;
  next: () => Promise<void>;
}

export interface EpubViewerProps {
  epubUrl: string;
  title?: string;
  /** Key for persisting location (e.g. book slug). If set, location is saved to localStorage. */
  storageKey?: string;
  className?: string;
  layoutMode?: 'compact' | 'reader';
}

const READER_THEME_RULES = {
  'html, body': {
    background: '#f6efe3',
    color: '#22160f',
    margin: '0',
    padding: '0',
  },
  body: {
    'font-family': '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
    'font-size': '0.84rem',
    'line-height': '1.46',
    padding: '0',
  },
  p: {
    margin: '0 0 0.58rem',
  },
  'h1, h2, h3, h4': {
    color: '#1d120d',
    'font-family': '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
    'font-weight': '700',
    'letter-spacing': '-0.02em',
    'line-height': '1.12',
    margin: '0 0 0.9rem',
  },
  h1: {
    'font-size': '2rem',
  },
  h2: {
    'font-size': '1.9rem',
  },
  a: {
    color: '#7b4f27',
    'text-decoration': 'none',
  },
  img: {
    'border-radius': '1rem',
    'box-shadow': '0 24px 50px rgba(43, 27, 16, 0.2)',
    display: 'block',
    margin: '0.6rem auto',
    'max-width': '100%',
  },
  '.reader-page': {
    'box-sizing': 'border-box',
    display: 'flex',
    'flex-direction': 'column',
    'min-height': '100%',
    padding: '0.88rem 1.18rem 0.78rem',
  },
  '.reader-page__header': {
    margin: '0 0 0.4rem',
  },
  '.reader-page__running-head': {
    color: '#836142',
    'font-family': 'var(--font-sans)',
    'font-size': '0.62rem',
    'font-weight': '700',
    'letter-spacing': '0.2em',
    margin: '0',
    'text-transform': 'uppercase',
  },
  '.reader-page__chapter': {
    color: '#836142',
    'font-family': 'var(--font-sans)',
    'font-size': '0.68rem',
    'font-weight': '700',
    'letter-spacing': '0.22em',
    margin: '0 0 0.38rem',
    'text-transform': 'uppercase',
  },
  '.reader-page__title': {
    color: '#1b120d',
    'font-size': '1.3rem',
    'line-height': '1.02',
    margin: '0',
  },
  '.reader-page__figure': {
    margin: '0.24rem 0 0.56rem',
    'page-break-inside': 'avoid',
    'break-inside': 'avoid',
  },
  '.reader-page__figure-frame': {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'min-height': '7.6rem',
    height: '7.6rem',
    padding: '0.42rem',
    'box-sizing': 'border-box',
    overflow: 'hidden',
    border: '1px solid rgba(102, 69, 36, 0.12)',
    'border-radius': '0.7rem',
    background:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.38), rgba(232, 219, 198, 0.62)), #efe1cb',
    'box-shadow': '0 12px 24px rgba(32, 18, 8, 0.12)',
  },
  '.reader-page__figure img': {
    'border-radius': '0.58rem',
    'box-shadow': 'none',
    margin: '0 auto',
    height: '100%',
    'object-fit': 'cover',
    'object-position': 'center',
    width: '100%',
  },
  '.reader-page__figure--placeholder .reader-page__figure-frame': {
    'border-style': 'dashed',
  },
  '.reader-page__placeholder': {
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'min-height': '6.8rem',
    width: '100%',
    'border-radius': '0.58rem',
    background:
      'radial-gradient(circle at top, rgba(140, 102, 67, 0.14), transparent 58%), linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(216, 196, 166, 0.34))',
    color: '#8b6a4a',
    'font-family': 'var(--font-sans)',
    'font-size': '0.62rem',
    'font-weight': '700',
    'letter-spacing': '0.16em',
    'text-align': 'center',
    'text-transform': 'uppercase',
  },
  '.reader-page__body': {
    flex: '1 1 auto',
  },
  '.reader-page__body p': {
    margin: '0 0 0.58rem',
    'line-height': '1.46',
  },
  '.reader-page__footer': {
    'border-top': '1px solid rgba(94, 67, 41, 0.16)',
    'margin-top': 'auto',
    'padding-top': '0.45rem',
    'text-align': 'center',
  },
  '.reader-page__folio': {
    color: '#836142',
    'font-family': 'var(--font-sans)',
    'font-size': '0.68rem',
    'letter-spacing': '0.18em',
  },
  '.h1, nav h1, h1.h1': {
    color: '#1d120d',
    'font-size': '2.1rem',
    'line-height': '1.08',
    margin: '0 0 1.2rem',
  },
  'nav, nav[epub\\:type~="toc"]': {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,236,221,0.95))',
    border: '1px solid rgba(102, 69, 36, 0.18)',
    'border-radius': '1.6rem',
    'box-shadow': '0 18px 40px rgba(43, 27, 16, 0.08)',
    padding: '2.25rem 2.4rem',
  },
  'nav ol': {
    margin: '1.35rem 0 0',
    padding: '0 0 0 1.4rem',
  },
  'nav li': {
    'border-bottom': '1px solid rgba(102, 69, 36, 0.12)',
    margin: '0',
    padding: '0.55rem 0',
  },
  'nav li:last-child': {
    'border-bottom': 'none',
  },
  'nav a, nav a:visited': {
    color: '#2a1710',
    'font-size': '1rem',
    'font-weight': '600',
  },
};

function createReaderStyles({
  headerOffset,
  layoutMode,
}: {
  headerOffset: number;
  layoutMode: 'compact' | 'reader';
}) {
  const isReaderMode = layoutMode === 'reader';
  const tocWidth = isReaderMode ? 360 : 296;

  return {
    ...ReactReaderStyle,
    container: {
      ...ReactReaderStyle.container,
      background: isReaderMode
        ? 'radial-gradient(circle at top, rgba(117,78,38,0.18), transparent 34%), #120d0a'
        : 'var(--color-dark, #151515)',
    },
    readerArea: {
      ...ReactReaderStyle.readerArea,
      background: isReaderMode
        ? 'linear-gradient(180deg, rgba(23,17,13,0.96), rgba(18,13,10,0.98))'
        : 'var(--color-dark-alt, #1a1a1a)',
    },
    titleArea: {
      ...ReactReaderStyle.titleArea,
      display: 'none',
    },
    reader: {
      ...ReactReaderStyle.reader,
      top: headerOffset,
      left: isReaderMode ? 24 : 24,
      right: isReaderMode ? 24 : 24,
      bottom: isReaderMode ? READER_FOOTER_H + 16 : 24,
      maxWidth: isReaderMode ? '88rem' : '48rem',
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '100%',
    },
    arrow: {
      ...ReactReaderStyle.arrow,
      color: 'rgba(227, 211, 187, 0.72)',
      fontSize: isReaderMode ? 56 : 48,
      textShadow: isReaderMode ? '0 10px 30px rgba(0, 0, 0, 0.45)' : undefined,
    },
    arrowHover: {
      ...ReactReaderStyle.arrowHover,
      color: '#fff4e6',
    },
    prev: {
      ...ReactReaderStyle.prev,
      display: isReaderMode ? 'none' : ReactReaderStyle.prev.display,
    },
    next: {
      ...ReactReaderStyle.next,
      display: isReaderMode ? 'none' : ReactReaderStyle.next.display,
    },
    tocArea: {
      ...ReactReaderStyle.tocArea,
      background: isReaderMode
        ? 'linear-gradient(180deg, rgba(28,20,15,0.98), rgba(16,11,8,0.98))'
        : 'var(--color-dark-elevated, #1f1f1f)',
      borderRight: '1px solid rgba(140, 102, 67, 0.18)',
      boxShadow: isReaderMode ? '18px 0 50px rgba(0,0,0,0.32)' : undefined,
      padding: isReaderMode ? '1.25rem 1rem' : '1rem 0',
      width: tocWidth,
    },
    toc: {
      ...ReactReaderStyle.toc,
      padding: 0,
      fontFamily: 'var(--font-sans)',
    },
    tocAreaButton: {
      ...ReactReaderStyle.tocAreaButton,
      fontFamily: 'var(--font-sans)',
      fontSize: isReaderMode ? '0.95rem' : '0.9375rem',
      lineHeight: 1.45,
      marginBottom: isReaderMode ? '0.45rem' : undefined,
      border: isReaderMode ? '1px solid rgba(140, 102, 67, 0.12)' : undefined,
      borderBottom: isReaderMode ? undefined : '1px solid var(--color-border, #252525)',
      borderRadius: isReaderMode ? '1rem' : undefined,
      background: isReaderMode ? 'rgba(255,255,255,0.02)' : undefined,
      padding: isReaderMode ? '0.9rem 1rem' : '0.75rem 1.25rem',
      color: 'var(--color-text, #e5e7eb)',
      textAlign: 'left' as const,
      transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
    },
    tocButton: {
      ...ReactReaderStyle.tocButton,
      background: isReaderMode
        ? 'rgba(18, 13, 10, 0.92)'
        : 'var(--color-dark-elevated, #1f1f1f)',
      border: '1px solid rgba(140, 102, 67, 0.22)',
      borderRadius: isReaderMode ? '999px' : undefined,
      color: 'var(--color-text, #e5e7eb)',
      boxShadow: isReaderMode ? '0 14px 30px rgba(0,0,0,0.22)' : undefined,
    },
    tocButtonExpanded: {
      ...ReactReaderStyle.tocButtonExpanded,
      background: isReaderMode ? 'rgba(49, 32, 19, 0.96)' : 'var(--color-dark-elevated, #1f1f1f)',
    },
    tocButtonBar: {
      ...ReactReaderStyle.tocButtonBar,
      background: '#d5b083',
    },
    containerExpanded: {
      ...ReactReaderStyle.containerExpanded,
      transform: `translateX(${tocWidth}px)`,
    },
    tocBackground: {
      ...ReactReaderStyle.tocBackground,
      left: tocWidth,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: isReaderMode ? 'blur(6px)' : undefined,
    },
    loadingView: {
      ...ReactReaderStyle.loadingView,
      color: 'var(--color-text-muted, #94a3b8)',
    },
    errorView: {
      ...ReactReaderStyle.errorView,
      color: 'var(--color-accent, #d5b083)',
    },
  };
}

function flattenToc(items: ReaderNavItem[]): ReaderNavItem[] {
  return items.flatMap((item) => [item, ...(item.subitems ? flattenToc(item.subitems) : [])]);
}

function normalizeHref(href?: string) {
  return (href || '').split('#')[0].replace(/^\/+/, '');
}

function resolveSectionLabel(toc: ReaderNavItem[], href?: string) {
  const currentHref = normalizeHref(href);
  if (!currentHref) return '';

  const flattened = flattenToc(toc);
  const exactMatch = flattened.find((item) => normalizeHref(item.href) === currentHref);
  if (exactMatch) return exactMatch.label;

  const endMatch = flattened.find((item) => {
    const itemHref = normalizeHref(item.href);
    return itemHref && (currentHref.endsWith(itemHref) || itemHref.endsWith(currentHref));
  });
  if (endMatch) return endMatch.label;

  const prefixMatch = flattened.find((item) => {
    const itemHref = normalizeHref(item.href);
    return itemHref && currentHref.startsWith(itemHref);
  });

  return prefixMatch?.label ?? '';
}

function createEpubViewStyles(layoutMode: 'compact' | 'reader') {
  return {
    viewHolder: {
      position: 'relative' as const,
      height: '100%',
      width: '100%',
    },
    view: {
      height: '100%',
      background: layoutMode === 'reader' ? '#f4ecdf' : '#fafafa',
      color: '#1a1a1a',
      borderRadius: layoutMode === 'reader' ? '1.4rem' : undefined,
      boxShadow:
        layoutMode === 'reader' ? '0 24px 70px rgba(11, 6, 3, 0.38)' : undefined,
    },
  };
}

function renderTocTree(
  items: ReaderNavItem[],
  onSelect: (href?: string) => void,
  depth = 0
): ReactNode {
  return items.map((item) => {
    const href = item.href || '';

    return (
      <div key={`${depth}-${href}-${item.label}`} className="space-y-1">
        <button
          type="button"
          onClick={() => onSelect(href)}
          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[rgba(236,223,204,0.82)] transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-[#fff3e5]"
          style={{ paddingLeft: `${0.75 + depth * 0.9}rem` }}
        >
          {item.label}
        </button>
        {item.subitems?.length ? renderTocTree(item.subitems, onSelect, depth + 1) : null}
      </div>
    );
  });
}

export default function EpubViewer({
  epubUrl,
  title,
  storageKey,
  className = '',
  layoutMode = 'compact',
}: EpubViewerProps) {
  const [location, setLocation] = useState<string | number>(0);
  const [epubBuffer, setEpubBuffer] = useState<ArrayBuffer | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tocItems, setTocItems] = useState<ReaderNavItem[]>([]);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [currentSectionLabel, setCurrentSectionLabel] = useState('');
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [pageDraft, setPageDraft] = useState('');
  const renditionCleanupRef = useRef<(() => void) | null>(null);
  const renditionRef = useRef<ReaderRendition | null>(null);
  const latestLocationRef = useRef<ReaderLocation | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    latestLocationRef.current = null;
    renditionRef.current = null;

    fetch(epubUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch EPUB (${response.status})`);
        }

        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (controller.signal.aborted) return;
        setEpubBuffer(buffer);
        setLoadedUrl(epubUrl);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error ? error.message : 'Unable to load this EPUB right now.';
        setLoadedUrl(epubUrl);
        setEpubBuffer(null);
        setLoadError(message);
      });

    return () => {
      controller.abort();
    };
  }, [epubUrl]);

  useEffect(() => {
    return () => {
      renditionCleanupRef.current?.();
      renditionCleanupRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (saved) {
      queueMicrotask(() => setLocation(saved));
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || typeof location !== 'string') return;
    try {
      window.localStorage.setItem(STORAGE_PREFIX + storageKey, location);
    } catch {
      // ignore quota / private mode
    }
  }, [storageKey, location]);

  const locationChanged = useCallback((epubcfi: string) => {
    setLocation(epubcfi);
  }, []);
  const isLoadingBook = loadedUrl !== epubUrl && !loadError;
  const readyBuffer = loadedUrl === epubUrl ? epubBuffer : null;
  const visibleError = loadedUrl === epubUrl ? loadError : null;
  const headerOffset = title ? READER_HEADER_H : 0;
  const readerStyles = createReaderStyles({ headerOffset, layoutMode });
  const epubViewStyles = createEpubViewStyles(layoutMode);

  const syncReaderPosition = useCallback(
    (nextLocation: ReaderLocation, nextTocItems: ReaderNavItem[] = tocItems) => {
      latestLocationRef.current = nextLocation;

      const nextSectionLabel = resolveSectionLabel(nextTocItems, nextLocation.start?.href);
      setCurrentSectionLabel(nextSectionLabel);

      const generatedPageTotal = renditionRef.current?.book.locations.length?.() ?? 0;
      const fallbackTotal = nextLocation.start?.displayed?.total ?? 0;
      const resolvedTotal = generatedPageTotal || fallbackTotal;
      setTotalPages(resolvedTotal > 0 ? resolvedTotal : null);

      let resolvedPage: number | null = null;
      const currentCfi = nextLocation.start?.cfi;

      if (generatedPageTotal > 0 && currentCfi) {
        const percentage = renditionRef.current?.book.locations.percentageFromCfi(currentCfi) ?? 0;
        resolvedPage = Math.min(
          generatedPageTotal,
          Math.max(1, Math.round(percentage * Math.max(generatedPageTotal - 1, 1)) + 1)
        );
      } else if (nextLocation.start?.displayed?.page) {
        resolvedPage = nextLocation.start.displayed.page;
      }

      setCurrentPage(resolvedPage);
      setPageDraft(resolvedPage ? String(resolvedPage) : '');
    },
    [tocItems]
  );

  const handleTocChanged = useCallback(
    (nextToc: ReaderNavItem[]) => {
      setTocItems(nextToc);
      if (latestLocationRef.current) {
        syncReaderPosition(latestLocationRef.current, nextToc);
      }
    },
    [syncReaderPosition]
  );

  const handleRendition = useCallback(
    (rendition: ReaderRendition) => {
      renditionCleanupRef.current?.();
      renditionRef.current = rendition;
      const applyLayout = () => {
        const useSpread =
          typeof window !== 'undefined' &&
          layoutMode === 'reader' &&
          window.matchMedia(READER_SPREAD_QUERY).matches;

        rendition.flow('paginated');
        rendition.spread(useSpread ? 'always' : 'none', 1200);
      };

      rendition.themes.register('portfolio-reader', READER_THEME_RULES);
      rendition.themes.select('portfolio-reader');
      rendition.themes.fontSize(layoutMode === 'reader' ? '96%' : '100%');
      applyLayout();

      const handleRelocated = (nextLocation: ReaderLocation) => {
        syncReaderPosition(nextLocation);
      };

      rendition.on('relocated', handleRelocated);

      void rendition.book.loaded.navigation.then((navigation) => {
        setTocItems(navigation.toc);
        if (latestLocationRef.current) {
          syncReaderPosition(latestLocationRef.current, navigation.toc);
        }
      });

      void rendition.book.ready
        .then(() => rendition.book.locations.generate(LOCATION_GENERATION_CHARS))
        .then(() => {
          const locationTotal = rendition.book.locations.length();
          setTotalPages(locationTotal > 0 ? locationTotal : null);

          if (latestLocationRef.current) {
            syncReaderPosition(latestLocationRef.current);
          }
        })
        .catch(() => {
          // fall back to display-based page counts if location generation fails
        });

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', applyLayout);
        renditionCleanupRef.current = () => {
          window.removeEventListener('resize', applyLayout);
          rendition.off('relocated', handleRelocated);
        };
      } else {
        renditionCleanupRef.current = () => {
          rendition.off('relocated', handleRelocated);
        };
      }
    },
    [layoutMode, syncReaderPosition]
  );

  const handleStepPage = useCallback((direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      void renditionRef.current?.prev();
      return;
    }

    void renditionRef.current?.next();
  }, []);

  const handleJumpToPage = useCallback(() => {
    const parsedPage = Number.parseInt(pageDraft, 10);
    if (!Number.isFinite(parsedPage) || !totalPages || totalPages <= 0) {
      return;
    }

    const clampedPage = Math.min(totalPages, Math.max(1, parsedPage));
    const percentage =
      totalPages <= 1 ? 0 : (clampedPage - 1) / Math.max(totalPages - 1, 1);
    const cfi = renditionRef.current?.book.locations.cfiFromPercentage(percentage);

    if (!cfi) return;

    setLocation(cfi);
    setPageDraft(String(clampedPage));
  }, [pageDraft, totalPages]);

  const footerLabel =
    currentSectionLabel || (currentPage ? `Page ${currentPage}` : 'Current section');

  const handleTocSelect = useCallback((href?: string) => {
    if (href) {
      setLocation(href);
    }
    setIsTocOpen(false);
  }, []);

  return (
    <div className={`epub-reader-root relative flex h-full min-h-[400px] flex-col overflow-hidden ${className}`}>
      {title && (
        <header
          className="epub-reader-header flex items-center gap-3 shrink-0 px-4 border-b border-border bg-dark-alt"
          style={{ height: READER_HEADER_H }}
        >
          <BookOpen
            className="shrink-0 text-primary"
            size={22}
            strokeWidth={1.8}
            aria-hidden
          />
          <span className="text-sm font-medium text-primary truncate">{title}</span>
        </header>
      )}
      <div className="epub-reader-content flex-1 min-h-0 relative">
        {layoutMode === 'reader' ? (
          <>
            <div className="pointer-events-none absolute left-4 top-4 z-30">
              <button
                type="button"
                onClick={() => setIsTocOpen((value) => !value)}
                className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(140,102,67,0.18)] bg-[rgba(18,13,10,0.88)] text-[rgba(236,223,204,0.82)] shadow-[0_12px_24px_rgba(0,0,0,0.22)] backdrop-blur-md transition-colors hover:border-[rgba(213,176,131,0.32)] hover:text-[#fff3e5]"
                aria-label={isTocOpen ? 'Close contents' : 'Open contents'}
              >
                {isTocOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
            {isTocOpen ? (
              <>
                <div
                  className="absolute inset-0 z-20 bg-[rgba(0,0,0,0.36)] backdrop-blur-[2px]"
                  onClick={() => setIsTocOpen(false)}
                  aria-hidden
                />
                <aside className="absolute inset-y-0 left-0 z-30 w-[19rem] border-r border-[rgba(140,102,67,0.14)] bg-[linear-gradient(180deg,rgba(24,18,14,0.97),rgba(13,10,8,0.98))] px-4 pb-6 pt-16 shadow-[18px_0_40px_rgba(0,0,0,0.28)]">
                  <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[rgba(213,176,131,0.72)]">
                    Contents
                  </p>
                  <div className="mt-3 max-h-full overflow-y-auto pr-1">
                    {tocItems.length ? (
                      <div className="space-y-1">{renderTocTree(tocItems, handleTocSelect)}</div>
                    ) : (
                      <p className="px-3 text-sm text-[rgba(236,223,204,0.56)]">Loading contents...</p>
                    )}
                  </div>
                </aside>
              </>
            ) : null}
          </>
        ) : null}
        {isLoadingBook ? (
          <div className="flex h-full min-h-[inherit] items-center justify-center gap-3 text-sm text-text-muted">
            <LoaderCircle size={18} className="animate-spin" />
            <span>Loading book...</span>
          </div>
        ) : visibleError || !readyBuffer ? (
          <div className="flex h-full min-h-[inherit] items-center justify-center px-6 text-center text-sm text-text-muted">
            {visibleError ?? 'Unable to load this EPUB right now.'}
          </div>
        ) : (
          <ReactReader
            key={`${epubUrl}-${readyBuffer.byteLength}`}
            url={readyBuffer}
            title=""
            location={location}
            locationChanged={locationChanged}
            showToc={false}
            tocChanged={(nextToc) => handleTocChanged(nextToc as ReaderNavItem[])}
            getRendition={(rendition) => handleRendition(rendition as ReaderRendition)}
            epubOptions={{
              flow: 'paginated',
              manager: 'default',
              spread: layoutMode === 'reader' ? 'auto' : 'none',
              minSpreadWidth: 1200,
              snap: true,
            }}
            loadingView={<div className="flex h-full items-center justify-center gap-3 text-sm text-text-muted"><LoaderCircle size={18} className="animate-spin" /><span>Loading book...</span></div>}
            readerStyles={readerStyles}
            epubViewStyles={epubViewStyles}
          />
        )}
      </div>
      {layoutMode === 'reader' && readyBuffer && !isLoadingBook && !visibleError ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center px-4">
          <div className="pointer-events-auto flex w-full max-w-[102rem] items-center justify-between gap-3 rounded-full border border-[rgba(140,102,67,0.14)] bg-[rgba(12,9,7,0.78)] px-3 py-1.5 text-[0.76rem] text-[rgba(236,223,204,0.78)] shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur-md md:px-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium tracking-[0.03em] text-[rgba(247,239,229,0.82)]">
                {footerLabel}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStepPage('prev')}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(140,102,67,0.12)] bg-[rgba(255,255,255,0.03)] text-[rgba(236,223,204,0.78)] transition-colors hover:border-[rgba(213,176,131,0.24)] hover:text-[#fff3e5]"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex items-center gap-1.5 rounded-full border border-[rgba(140,102,67,0.1)] bg-[rgba(255,255,255,0.025)] px-2 py-1">
                <input
                  value={pageDraft}
                  onChange={(event) => setPageDraft(event.target.value.replace(/[^\d]/g, ''))}
                  onBlur={handleJumpToPage}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleJumpToPage();
                    }
                  }}
                  inputMode="numeric"
                  aria-label="Jump to page"
                  className="w-10 border-0 bg-transparent p-0 text-right text-[0.76rem] font-medium text-[rgba(247,239,229,0.9)] outline-none placeholder:text-[rgba(232,216,195,0.32)]"
                  placeholder={currentPage ? String(currentPage) : '1'}
                />
                <span className="text-[rgba(232,216,195,0.44)]">/</span>
                <span className="min-w-8 text-left text-[0.76rem] font-medium text-[rgba(232,216,195,0.68)]">
                  {totalPages ?? '...'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleStepPage('next')}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(140,102,67,0.12)] bg-[rgba(255,255,255,0.03)] text-[rgba(236,223,204,0.78)] transition-colors hover:border-[rgba(213,176,131,0.24)] hover:text-[#fff3e5]"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
