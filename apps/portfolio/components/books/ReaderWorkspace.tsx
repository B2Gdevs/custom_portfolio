'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Download, FolderUp, LibraryBig, RotateCcw, Upload } from 'lucide-react';
import type { BookEntry } from '@/lib/books';
import EpubViewer from '@/components/books/EpubViewerLazy';
import { ReaderPlanningStrip } from '@/components/books/ReaderPlanningStrip';
import { ReaderShelfCard } from '@/components/books/ReaderShelfCard';
import {
  EPUB_LOCATION_STORAGE_PREFIX,
  readStoredReaderProgress,
  resolveReaderShelfStatus,
} from '@/lib/reader-progress';
import { readerAppHref } from '@/lib/reader-routes';
import {
  resolveReaderWorkspaceState,
  type UploadedBookSource,
} from '@/lib/reader-workspace-state';

function slugifyFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function formatUploadedTitle(fileName: string) {
  const baseName = fileName.replace(/\.epub$/i, '').trim();
  const cleaned = baseName.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || 'Uploaded EPUB';
}

type ReaderProgressMap = Record<string, number | null>;

function loadProgressMap(books: BookEntry[]): ReaderProgressMap {
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
}: {
  books: BookEntry[];
  initialBook?: BookEntry;
  initialAt?: string;
  initialCfi?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedBook, setUploadedBook] = useState<UploadedBookSource | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [planningStripOpen, setPlanningStripOpen] = useState(false);
  const [progressByBook, setProgressByBook] = useState<ReaderProgressMap>({});

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

  const workspaceState = useMemo(
    () => resolveReaderWorkspaceState({ initialBook, uploadedBook }),
    [initialBook, uploadedBook]
  );
  const activeTitle = workspaceState.title;
  const activeKicker = workspaceState.kicker;
  const hasBuiltInBook = workspaceState.mode === 'built-in-reading' || workspaceState.canDownload;
  const isLibraryView = workspaceState.mode === 'library';
  const downloadHref =
    workspaceState.bookSlug && workspaceState.canDownload ? `/books/${workspaceState.bookSlug}/book.epub` : null;
  const downloadName = workspaceState.bookSlug && workspaceState.canDownload ? `${workspaceState.bookSlug}.epub` : null;

  const deeplinkLocation = useMemo(() => {
    const cfi = initialCfi?.trim();
    if (cfi) return cfi;
    const at = initialAt?.trim();
    if (at) return at;
    return undefined;
  }, [initialAt, initialCfi]);

  const viewerSource = workspaceState.viewerSource;

  const builtInBooks = useMemo(() => books.filter((entry) => entry.hasEpub), [books]);
  const queuedBooks = useMemo(() => books.filter((entry) => !entry.hasEpub), [books]);

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

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
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[radial-gradient(circle_at_top,rgba(136,94,48,0.16),transparent_28%),linear-gradient(180deg,#130d09,#0d0907)]">
      <div className="shrink-0 border-b border-[rgba(140,102,67,0.22)] bg-[rgba(19,13,9,0.9)] backdrop-blur">
        <div className="mx-auto flex max-w-[120rem] flex-wrap items-end justify-between gap-x-3 gap-y-2 px-4 pb-0 pt-2.5 md:px-5">
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-x-3 gap-y-2">
            <div className="flex min-w-0 items-center gap-2.5 pb-2">
              {!isLibraryView ? (
                <Link
                  href="/apps/reader"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(140,102,67,0.2)] bg-[rgba(255,255,255,0.02)] px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-[rgba(213,176,131,0.45)] hover:text-[#f6e8d8]"
                >
                  <ArrowLeft size={15} />
                  Library
                </Link>
              ) : null}
              <div className="min-w-0">
                <p className="section-kicker">{activeKicker}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  {isLibraryView ? (
                    <LibraryBig size={16} className="shrink-0 text-[#d5b083]" />
                  ) : (
                    <BookOpen size={16} className="shrink-0 text-[#d5b083]" />
                  )}
                  <h1 className="truncate font-display text-[1.8rem] leading-none text-primary md:text-[2rem]">
                    {activeTitle}
                  </h1>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto pb-px">
              <div
                role="tablist"
                aria-label="Choose book"
                className="inline-flex items-center gap-1 rounded-t-[1.1rem] border border-b-0 border-[rgba(140,102,67,0.18)] bg-[rgba(9,7,6,0.44)] px-1 py-1"
              >
                <Link
                  href={readerAppHref()}
                  role="tab"
                  aria-selected={isLibraryView}
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-sm font-medium transition-colors ${
                    isLibraryView
                      ? 'border-[rgba(213,176,131,0.45)] bg-[rgba(213,176,131,0.16)] text-[#fff3e5] shadow-[0_8px_16px_rgba(0,0,0,0.12)]'
                      : 'border-transparent bg-transparent text-[rgba(236,216,191,0.78)] hover:border-[rgba(140,102,67,0.22)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[#fff3e5]'
                  }`}
                >
                  Shelf
                </Link>
                {uploadedBook || !hasBuiltInBook ? (
                  <span
                    role="tab"
                    aria-selected={Boolean(uploadedBook)}
                    className="inline-flex items-center rounded-full border border-[rgba(213,176,131,0.45)] bg-[rgba(213,176,131,0.16)] px-2.5 py-1 text-sm font-medium text-[#fff3e5] shadow-[0_8px_16px_rgba(0,0,0,0.12)]"
                  >
                    {uploadedBook ? uploadedBook.title : 'Local EPUB'}
                  </span>
                ) : null}
                {books.map((entry) => {
                  const isActive = workspaceState.mode === 'built-in-reading' && entry.slug === workspaceState.bookSlug;

                  if (!entry.hasEpub) {
                    return (
                      <span
                        key={entry.slug}
                        role="tab"
                        aria-selected="false"
                        aria-disabled="true"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(140,102,67,0.14)] bg-[rgba(255,255,255,0.02)] px-2.5 py-1 text-sm text-[rgba(229,213,191,0.5)]"
                      >
                        <span>{entry.title}</span>
                        <span className="text-[0.68rem] uppercase tracking-[0.18em] text-[rgba(213,176,131,0.52)]">
                          Coming soon
                        </span>
                      </span>
                    );
                  }

                  return (
                    <Link
                      key={entry.slug}
                      href={readerAppHref({ book: entry.slug })}
                      role="tab"
                      aria-selected={isActive}
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-[rgba(213,176,131,0.45)] bg-[rgba(213,176,131,0.16)] text-[#fff3e5] shadow-[0_8px_16px_rgba(0,0,0,0.12)]'
                          : 'border-transparent bg-transparent text-[rgba(236,216,191,0.78)] hover:border-[rgba(140,102,67,0.22)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[#fff3e5]'
                      }`}
                    >
                      {entry.title}
                    </Link>
                  );
                })}
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
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(140,102,67,0.24)] bg-[rgba(255,255,255,0.02)] px-3 py-1.5 text-sm font-medium text-[#ecd8bf] transition-colors hover:border-[rgba(213,176,131,0.45)] hover:text-[#fff3e5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FolderUp size={15} />
              {isUploading ? 'Opening EPUB...' : 'Open EPUB'}
            </button>
            {uploadedBook && hasBuiltInBook ? (
              <button
                type="button"
                onClick={() => {
                  setUploadedBook(null);
                  setUploadError(null);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(140,102,67,0.24)] bg-[rgba(255,255,255,0.02)] px-3 py-1.5 text-sm font-medium text-[#ecd8bf] transition-colors hover:border-[rgba(213,176,131,0.45)] hover:text-[#fff3e5]"
              >
                <RotateCcw size={15} />
                Return to Library Book
              </button>
            ) : null}
            {!uploadedBook && hasBuiltInBook ? (
              <a
                href={downloadHref ?? undefined}
                download={downloadName ?? undefined}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(140,102,67,0.24)] bg-[rgba(255,255,255,0.02)] px-3 py-1.5 text-sm font-medium text-[#ecd8bf] transition-colors hover:border-[rgba(213,176,131,0.45)] hover:text-[#fff3e5]"
              >
                <Download size={15} />
                Download EPUB
              </a>
            ) : null}
          </div>
        </div>
        {uploadError ? (
          <div className="mx-auto max-w-[120rem] px-4 pb-2 md:px-5">
            <p className="text-sm text-[rgba(246,189,162,0.92)]">{uploadError}</p>
          </div>
        ) : null}
        {workspaceState.mode === 'local-reading' && workspaceState.localFileName ? (
          <div className="mx-auto max-w-[120rem] px-4 pb-2 md:px-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[rgba(213,176,131,0.7)]">
              Reading local file: {workspaceState.localFileName}
            </p>
          </div>
        ) : null}
      </div>
      <ReaderPlanningStrip
        bookSlug={workspaceState.bookSlug ?? undefined}
        open={planningStripOpen}
        onToggle={() => setPlanningStripOpen((v) => !v)}
      />
      <div className="min-h-0 flex-1 px-3 pb-3 pt-3 md:px-4 md:pb-4">
        <div className="mx-auto h-full max-w-[120rem] overflow-hidden rounded-[2rem] border border-[rgba(140,102,67,0.18)] bg-[rgba(15,10,8,0.84)] shadow-[0_34px_120px_rgba(0,0,0,0.36)]">
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
            <div className="h-full overflow-auto px-5 py-6 md:px-7 md:py-8">
              <div className="mx-auto max-w-[112rem] space-y-8">
                <section className="grid gap-6 rounded-[2rem] border border-[rgba(140,102,67,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] p-5 md:grid-cols-[minmax(0,1.7fr)_20rem] md:p-6">
                  <div>
                    <p className="section-kicker">Built-in library</p>
                    <h2 className="mt-2 font-display text-[2.25rem] leading-none text-primary md:text-[2.75rem]">
                      Your EPUB shelf stays ready here
                    </h2>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-[rgba(236,223,204,0.72)]">
                      The reader now opens on your built books first. Covers, author metadata, and reading status stay visible so the workspace reads like a shelf instead of a file picker.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2 text-[0.72rem] uppercase tracking-[0.16em] text-[rgba(213,176,131,0.72)]">
                      <span className="rounded-full border border-sky-300/24 bg-sky-300/10 px-3 py-1.5 text-sky-100">
                        New
                      </span>
                      <span className="rounded-full border border-[rgba(213,176,131,0.35)] bg-[rgba(213,176,131,0.12)] px-3 py-1.5 text-[#fff3e5]">
                        % Read
                      </span>
                      <span className="rounded-full border border-emerald-400/24 bg-emerald-400/10 px-3 py-1.5 text-emerald-100">
                        Done
                      </span>
                      <span className="rounded-full border border-[rgba(140,102,67,0.18)] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 text-[rgba(236,223,204,0.68)]">
                        Coming soon
                      </span>
                    </div>
                  </div>
                  <div className="rounded-[1.8rem] border border-[rgba(140,102,67,0.18)] bg-[rgba(255,255,255,0.03)] p-5">
                    <p className="section-kicker">Local utility</p>
                    <h3 className="mt-2 font-display text-[1.8rem] leading-none text-primary">
                      Open a file from this machine
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[rgba(236,223,204,0.68)]">
                      Keep ad-hoc imports available, but secondary. Built-in books remain the default workspace; local EPUBs are a temporary side path.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenFilePicker}
                      disabled={isUploading}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-secondary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Upload size={15} />
                      {isUploading ? 'Opening EPUB...' : 'Choose local EPUB'}
                    </button>
                    <div className="mt-4 text-xs leading-5 text-[rgba(236,223,204,0.54)]">
                      Reads only in this browser session and local storage. No uploads or server persistence.
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="section-kicker">Library</p>
                      <h3 className="mt-2 font-display text-[2rem] leading-none text-primary">Built books</h3>
                    </div>
                    <p className="text-sm text-[rgba(236,223,204,0.6)]">
                      {builtInBooks.length} available now, {queuedBooks.length} queued behind manuscript and build work.
                    </p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {builtInBooks.map((book) => {
                      const storedProgress = progressByBook[book.slug] ?? null;
                      const status = resolveReaderShelfStatus(book.hasEpub, storedProgress);
                      const isActive = hasSavedLocation(book.slug);

                      return (
                        <ReaderShelfCard
                          key={book.slug}
                          book={book}
                          status={status}
                          isActive={isActive}
                        />
                      );
                    })}
                    {queuedBooks.map((book) => (
                      <ReaderShelfCard
                        key={book.slug}
                        book={book}
                        status={resolveReaderShelfStatus(false, null)}
                        isActive={false}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
