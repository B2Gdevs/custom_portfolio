'use client';

import { useState, useCallback, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { ReactReader, ReactReaderStyle } from 'react-reader';

const STORAGE_PREFIX = 'epub-location-';
const READER_HEADER_H = 52;

export interface EpubViewerProps {
  epubUrl: string;
  title?: string;
  /** Key for persisting location (e.g. book slug). If set, location is saved to localStorage. */
  storageKey?: string;
  className?: string;
}

const readerStyles = {
  ...ReactReaderStyle,
  container: {
    ...ReactReaderStyle.container,
    background: 'var(--color-dark, #151515)',
  },
  readerArea: {
    ...ReactReaderStyle.readerArea,
    backgroundColor: 'var(--color-dark-alt, #1a1a1a)',
  },
  titleArea: {
    ...ReactReaderStyle.titleArea,
    display: 'none',
  },
  reader: {
    ...ReactReaderStyle.reader,
    top: READER_HEADER_H,
    left: 24,
    right: 24,
    bottom: 24,
    maxWidth: '48rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
  },
  arrow: {
    ...ReactReaderStyle.arrow,
    color: 'var(--color-text-muted, #94a3b8)',
    fontSize: 48,
  },
  arrowHover: {
    ...ReactReaderStyle.arrowHover,
    color: 'var(--color-primary, #fff)',
  },
  tocArea: {
    ...ReactReaderStyle.tocArea,
    background: 'var(--color-dark-elevated, #1f1f1f)',
    borderRight: '1px solid var(--color-border, #252525)',
    padding: '16px 0',
    width: 280,
  },
  toc: {
    ...ReactReaderStyle.toc,
    padding: 0,
    fontFamily: 'var(--font-sans)',
  },
  tocAreaButton: {
    ...ReactReaderStyle.tocAreaButton,
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9375rem',
    padding: '0.75rem 1.25rem',
    color: 'var(--color-text, #e5e7eb)',
    borderBottom: '1px solid var(--color-border, #252525)',
    transition: 'background 0.15s ease, color 0.15s ease',
  },
  tocButton: {
    ...ReactReaderStyle.tocButton,
    background: 'var(--color-dark-elevated, #1f1f1f)',
    border: '1px solid var(--color-border, #252525)',
    color: 'var(--color-text, #e5e7eb)',
  },
  tocButtonExpanded: {
    ...ReactReaderStyle.tocButtonExpanded,
    background: 'var(--color-dark-elevated, #1f1f1f)',
  },
  tocButtonBar: {
    ...ReactReaderStyle.tocButtonBar,
    background: 'var(--color-text-muted, #94a3b8)',
  },
  containerExpanded: {
    ...ReactReaderStyle.containerExpanded,
    transform: 'translateX(280px)',
  },
  tocBackground: {
    ...ReactReaderStyle.tocBackground,
    left: 280,
    background: 'rgba(0,0,0,0.5)',
  },
  loadingView: {
    ...ReactReaderStyle.loadingView,
    color: 'var(--color-text-muted, #94a3b8)',
  },
  errorView: {
    ...ReactReaderStyle.errorView,
    color: 'var(--color-accent, #3b82f6)',
  },
};

const epubViewStyles = {
  viewHolder: {
    position: 'relative' as const,
    height: '100%',
    width: '100%',
  },
  view: {
    height: '100%',
    background: '#fafafa',
    color: '#1a1a1a',
  },
};

export default function EpubViewer({
  epubUrl,
  title,
  storageKey,
  className = '',
}: EpubViewerProps) {
  const [location, setLocation] = useState<string | number>(0);

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (saved) {
      queueMicrotask(() => setLocation(saved));
    }
  }, [storageKey]);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    queueMicrotask(() => setError(null));
  }, [epubUrl]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center p-8 bg-dark-alt text-text ${className}`}
        role="alert"
      >
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

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
        <ReactReader
          url={epubUrl}
          title=""
          location={location}
          locationChanged={locationChanged}
          showToc={true}
          readerStyles={readerStyles}
          epubViewStyles={epubViewStyles}
        />
      </div>
    </div>
  );
}
