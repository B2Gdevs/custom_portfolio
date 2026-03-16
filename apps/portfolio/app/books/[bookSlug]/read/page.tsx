import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Download } from 'lucide-react';
import { getBookBySlug, getBooks } from '@/lib/books';
import EpubViewer from '@/components/books/EpubViewerLazy';

export default async function BookReadPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = await params;
  const book = getBookBySlug(bookSlug);
  const books = getBooks();
  if (!book || !book.hasEpub) notFound();

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col bg-[radial-gradient(circle_at_top,rgba(136,94,48,0.16),transparent_28%),linear-gradient(180deg,#130d09,#0d0907)]">
      <div className="shrink-0 border-b border-[rgba(140,102,67,0.22)] bg-[rgba(19,13,9,0.9)] backdrop-blur">
        <div className="mx-auto flex max-w-[120rem] flex-col gap-5 px-4 py-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(140,102,67,0.2)] bg-[rgba(255,255,255,0.02)] px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-[rgba(213,176,131,0.45)] hover:text-[#f6e8d8]"
              >
                <ArrowLeft size={16} />
                Back to Books
              </Link>
              <div className="min-w-0">
                <p className="section-kicker">Reader</p>
                <div className="mt-2 flex items-center gap-3">
                  <BookOpen size={18} className="shrink-0 text-[#d5b083]" />
                  <h1 className="truncate font-display text-2xl text-primary md:text-3xl">
                    {book.title}
                  </h1>
                </div>
              </div>
            </div>
            <a
              href={`/books/${book.slug}/book.epub`}
              download={`${book.slug}.epub`}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(140,102,67,0.24)] bg-[rgba(255,255,255,0.02)] px-4 py-2 text-sm font-medium text-[#ecd8bf] transition-colors hover:border-[rgba(213,176,131,0.45)] hover:text-[#fff3e5]"
            >
              <Download size={16} />
              Download EPUB
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgba(213,176,131,0.7)]">
              Switch book
            </span>
            <div className="flex flex-1 flex-wrap gap-2">
              {books.map((entry) => {
                const isActive = entry.slug === book.slug;

                if (!entry.hasEpub) {
                  return (
                    <span
                      key={entry.slug}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(140,102,67,0.14)] bg-[rgba(255,255,255,0.02)] px-4 py-2 text-sm text-[rgba(229,213,191,0.5)]"
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
                    href={`/books/${entry.slug}/read`}
                    className={`inline-flex items-center rounded-full border px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? 'border-[rgba(213,176,131,0.45)] bg-[rgba(213,176,131,0.14)] text-[#fff3e5]'
                        : 'border-[rgba(140,102,67,0.18)] bg-[rgba(255,255,255,0.02)] text-[rgba(236,216,191,0.86)] hover:border-[rgba(213,176,131,0.4)] hover:text-[#fff3e5]'
                    }`}
                  >
                    {entry.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 px-3 pb-3 pt-3 md:px-4 md:pb-4">
        <div className="mx-auto h-full max-w-[120rem] overflow-hidden rounded-[2rem] border border-[rgba(140,102,67,0.18)] bg-[rgba(15,10,8,0.84)] shadow-[0_34px_120px_rgba(0,0,0,0.36)]">
          <EpubViewer
            epubUrl={`/books/${bookSlug}/book.epub`}
            storageKey={bookSlug}
            className="h-full"
            layoutMode="reader"
          />
        </div>
      </div>
    </div>
  );
}
