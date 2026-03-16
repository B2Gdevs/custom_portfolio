'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { BookOpen, LoaderCircle } from 'lucide-react';
import { ReactReader, ReactReaderStyle } from 'react-reader';

const STORAGE_PREFIX = 'epub-location-';
const READER_HEADER_H = 52;
const READER_SPREAD_QUERY = '(min-width: 1200px)';

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
    'font-size': '0.94rem',
    'line-height': '1.6',
    padding: '0',
  },
  p: {
    margin: '0 0 0.78rem',
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
    margin: '1rem auto',
    'max-width': '100%',
  },
  '.reader-page': {
    'box-sizing': 'border-box',
    display: 'flex',
    'flex-direction': 'column',
    'min-height': '100%',
    padding: '1.35rem 1.85rem 1.1rem',
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
    'font-size': '2rem',
    'line-height': '1.02',
    margin: '0',
  },
  '.reader-page__figure': {
    margin: '0.85rem 0 0.95rem',
    'page-break-inside': 'avoid',
    'break-inside': 'avoid',
  },
  '.reader-page__figure img': {
    'border-radius': '0.8rem',
    'box-shadow': '0 18px 34px rgba(32, 18, 8, 0.16)',
    margin: '0 auto',
    'max-height': '15rem',
    'max-width': '18rem',
    'object-fit': 'cover',
    width: '100%',
  },
  '.reader-page__body': {
    flex: '1 1 auto',
  },
  '.reader-page__body p': {
    margin: '0 0 0.78rem',
  },
  '.reader-page__footer': {
    'border-top': '1px solid rgba(94, 67, 41, 0.16)',
    'margin-top': 'auto',
    'padding-top': '0.7rem',
    'text-align': 'center',
  },
  '.reader-page__folio': {
    color: '#836142',
    'font-family': 'var(--font-sans)',
    'font-size': '0.8rem',
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
      left: isReaderMode ? 52 : 24,
      right: isReaderMode ? 32 : 24,
      bottom: isReaderMode ? 28 : 24,
      maxWidth: isReaderMode ? '96rem' : '48rem',
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
  const renditionCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const controller = new AbortController();

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
  const handleRendition = useCallback(
    (rendition: {
      flow: (mode: string) => void;
      spread: (mode: string, min?: number) => void;
      themes: {
        register: (name: string, rules: Record<string, Record<string, string>>) => void;
        select: (name: string) => void;
        fontSize: (value: string) => void;
      };
    }) => {
      renditionCleanupRef.current?.();

      const applyLayout = () => {
        if (typeof window === 'undefined') return;
        const useSpread = window.matchMedia(READER_SPREAD_QUERY).matches;
        rendition.flow('paginated');
        rendition.spread(useSpread ? 'always' : 'none', 1200);
      };

      rendition.themes.register('portfolio-reader', READER_THEME_RULES);
      rendition.themes.select('portfolio-reader');
      rendition.themes.fontSize(layoutMode === 'reader' ? '112%' : '100%');
      applyLayout();

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', applyLayout);
        renditionCleanupRef.current = () => {
          window.removeEventListener('resize', applyLayout);
        };
      }
    },
    [layoutMode]
  );

  return (
    <div className={`epub-reader-root flex flex-col h-full min-h-[400px] overflow-hidden ${className}`}>
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
            showToc={true}
            getRendition={handleRendition}
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
    </div>
  );
}
