'use client';

import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Download, FolderUp, RotateCcw } from 'lucide-react';
import type { BookEntry } from '@/lib/books';
import EpubViewer from '@/components/books/EpubViewerLazy';
import { ReaderPlanningStrip } from '@/components/books/ReaderPlanningStrip';
import { readerAppHref } from '@/lib/reader-routes';

interface UploadedBookSource {
  buffer: ArrayBuffer;
  fileName: string;
  storageKey: string;
  title: string;
}

function slugifyFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function formatUploadedTitle(fileName: string) {
  const baseName = fileName.replace(/\.epub$/i, '').trim();
  const cleaned = baseName.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || 'Uploaded EPUB';
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

  const activeTitle = uploadedBook?.title ?? initialBook?.title ?? 'Open an EPUB';
  const activeKicker = uploadedBook ? 'Local EPUB' : 'Reader';
  const hasBuiltInBook = Boolean(initialBook?.hasEpub);
  const downloadHref = hasBuiltInBook ? `/books/${initialBook!.slug}/book.epub` : null;
  const downloadName = hasBuiltInBook ? `${initialBook!.slug}.epub` : null;

  const deeplinkLocation = useMemo(() => {
    const cfi = initialCfi?.trim();
    if (cfi) return cfi;
    const at = initialAt?.trim();
    if (at) return at;
    return undefined;
  }, [initialAt, initialCfi]);

  const viewerSource = useMemo(() => {
    if (uploadedBook) {
      return {
        epubData: uploadedBook.buffer,
        storageKey: uploadedBook.storageKey,
      };
    }

    if (initialBook?.hasEpub) {
      return {
        epubUrl: `/books/${initialBook.slug}/book.epub`,
        storageKey: initialBook.slug,
      };
    }

    return null;
  }, [initialBook, uploadedBook]);

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
      setUploadedBook({
        buffer,
        fileName: file.name,
        storageKey: `uploaded-epub-${slugifyFileName(file.name) || 'book'}`,
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
              <Link
                href="/apps/reader"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(140,102,67,0.2)] bg-[rgba(255,255,255,0.02)] px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-[rgba(213,176,131,0.45)] hover:text-[#f6e8d8]"
              >
                <ArrowLeft size={15} />
                Library
              </Link>
              <div className="min-w-0">
                <p className="section-kicker">{activeKicker}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <BookOpen size={16} className="shrink-0 text-[#d5b083]" />
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
                {uploadedBook || !hasBuiltInBook ? (
                  <span
                    role="tab"
                    aria-selected="true"
                    className="inline-flex items-center rounded-full border border-[rgba(213,176,131,0.45)] bg-[rgba(213,176,131,0.16)] px-2.5 py-1 text-sm font-medium text-[#fff3e5] shadow-[0_8px_16px_rgba(0,0,0,0.12)]"
                  >
                    {uploadedBook ? uploadedBook.title : 'Local EPUB'}
                  </span>
                ) : null}
                {books.map((entry) => {
                  const isActive = !uploadedBook && entry.slug === initialBook?.slug;

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
        {uploadedBook ? (
          <div className="mx-auto max-w-[120rem] px-4 pb-2 md:px-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[rgba(213,176,131,0.7)]">
              Reading local file: {uploadedBook.fileName}
            </p>
          </div>
        ) : null}
      </div>
      <ReaderPlanningStrip
        bookSlug={initialBook?.slug}
        open={planningStripOpen}
        onToggle={() => setPlanningStripOpen((v) => !v)}
      />
      <div className="flex-1 min-h-0 px-3 pb-3 pt-3 md:px-4 md:pb-4">
        <div className="mx-auto h-full max-w-[120rem] overflow-hidden rounded-[2rem] border border-[rgba(140,102,67,0.18)] bg-[rgba(15,10,8,0.84)] shadow-[0_34px_120px_rgba(0,0,0,0.36)]">
          {viewerSource ? (
            <EpubViewer
              key={deeplinkLocation ? `dl:${deeplinkLocation}` : `sk:${viewerSource.storageKey}`}
              epubUrl={viewerSource.epubUrl}
              epubData={viewerSource.epubData}
              storageKey={viewerSource.storageKey}
              initialLocation={deeplinkLocation}
              className="h-full"
              layoutMode="reader"
            />
          ) : (
            <div className="flex h-full min-h-[32rem] items-center justify-center px-6">
              <div className="max-w-xl rounded-[1.8rem] border border-[rgba(140,102,67,0.18)] bg-[rgba(255,255,255,0.03)] px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                <p className="section-kicker">Local Reading</p>
                <h2 className="mt-3 font-display text-4xl text-primary">Open an EPUB from your machine</h2>
                <p className="mt-4 text-base leading-7 text-[rgba(236,223,204,0.72)]">
                  This route is for ad-hoc reading. Choose any `.epub` file and it will open inside the same browser reader used for the built books.
                </p>
                <button
                  type="button"
                  onClick={handleOpenFilePicker}
                  disabled={isUploading}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-secondary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FolderUp size={16} />
                  {isUploading ? 'Opening EPUB...' : 'Choose EPUB'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
