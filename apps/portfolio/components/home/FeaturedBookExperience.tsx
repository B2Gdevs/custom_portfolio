'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Download, Sparkles } from 'lucide-react';
import type { BookEntry } from '@/lib/books';
import type { FeaturedBookShowcase } from '@/lib/featured-book';

export default function FeaturedBookExperience({
  featuredBook,
  books,
}: {
  featuredBook: FeaturedBookShowcase;
  books: BookEntry[];
}) {
  const readerBooks = useMemo(() => {
    const featured = books.find((book) => book.slug === featuredBook.slug);
    const remaining = books.filter((book) => book.slug !== featuredBook.slug);
    return featured ? [featured, ...remaining] : books;
  }, [books, featuredBook.slug]);
  const [selectedBookSlug, setSelectedBookSlug] = useState(featuredBook.slug);
  const selectedBook = readerBooks.find((book) => book.slug === selectedBookSlug) ?? readerBooks[0];
  const readerHref = selectedBook?.hasEpub ? `/books/${selectedBook.slug}/read` : '/books';
  const downloadHref = selectedBook?.hasEpub ? `/books/${selectedBook.slug}/book.epub` : null;

  return (
    <section
      id="read-now"
      className="section-shell"
    >
      <div className="mb-8 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
        <div>
          <p className="section-kicker">Read now</p>
          <h2 className="font-display text-4xl text-primary md:text-6xl">Enter {featuredBook.title}</h2>
          <p className="mt-5 text-lg leading-8 text-text-muted">{featuredBook.worldIntro}</p>

          <div className="mt-8 grid gap-4">
            {featuredBook.worldDetails.map((detail) => (
              <div
                key={detail}
                className="story-list-item"
              >
                <Sparkles
                  size={16}
                  className="mt-1 shrink-0 text-accent"
                />
                <p className="text-sm leading-7 text-text-muted">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/books/${featuredBook.slug}/read`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-secondary transition-opacity hover:opacity-90"
            >
              Go to the reader
            </Link>
            <a
              href={`/books/${featuredBook.slug}/book.epub`}
              download={`${featuredBook.slug}.epub`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-dark px-5 py-3 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
            >
              <Download size={16} />
              Download EPUB
            </a>
          </div>
        </div>

        <div className="story-card p-6 md:p-8">
          <p className="section-kicker">Reader</p>
          <h3 className="mt-2 font-display text-3xl text-primary">Read here on the front page</h3>
          <p className="mt-4 text-sm leading-7 text-text-muted">
            The homepage should stage the book and route into the real reader surface. The dedicated book reader page is the stable runtime, so the front page now works as the launch surface instead of mounting a second reader instance here.
          </p>
          <div className="mt-8 grid gap-4 text-sm text-text-muted sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-dark px-4 py-4">
              <div className="story-metric-value">{featuredBook.chapterCount || '3'}</div>
              <p className="mt-2">Structured chapter directories already exist in the repo.</p>
            </div>
            <div className="rounded-2xl border border-border bg-dark px-4 py-4">
              <div className="story-metric-value">{featuredBook.pageCount || '70+'}</div>
              <p className="mt-2">Markdown pages are already flowing through the EPUB build pipeline.</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="section-kicker">Book selector</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {readerBooks.map((book) => {
                const isSelected = book.slug === selectedBookSlug;
                const isAvailable = book.hasEpub;

                return (
                  <button
                    key={book.slug}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedBookSlug(book.slug);
                      }
                    }}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      isSelected
                        ? 'border-accent bg-accent/10 text-primary'
                        : 'border-border bg-dark text-text-muted'
                    } ${isAvailable ? 'hover:border-accent hover:text-primary' : 'cursor-not-allowed opacity-55'}`}
                  >
                    <span>{book.title}</span>
                    {!isAvailable && <span className="ml-2 text-xs uppercase tracking-[0.18em]">Coming soon</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        id="front-page-reader"
        className="story-card overflow-hidden p-6 md:p-8"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div className="rounded-[1.5rem] border border-border bg-dark px-6 py-8">
            <p className="section-kicker">Reader launch</p>
            <h3 className="mt-3 font-display text-3xl text-primary md:text-4xl">
              Open {selectedBook?.title ?? featuredBook.title} in the full reader
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted">
              The in-browser reader that works reliably lives on the dedicated book route. Use the selector above, then jump straight into the actual reading surface.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={readerHref}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-secondary transition-opacity hover:opacity-90"
              >
                Open reader page
              </Link>
              {downloadHref && (
                <a
                  href={downloadHref}
                  download={`${selectedBook.slug}.epub`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-dark-alt px-5 py-3 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
                >
                  <Download size={16} />
                  Download EPUB
                </a>
              )}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-dark px-6 py-8">
            <p className="section-kicker">Current selection</p>
            <h4 className="mt-3 font-display text-2xl text-primary md:text-3xl">
              {selectedBook?.title ?? featuredBook.title}
            </h4>
            <div className="mt-6 grid gap-4 text-sm text-text-muted sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-dark-alt px-4 py-4">
                <div className="story-metric-value">{selectedBook?.hasEpub ? 'Ready' : 'Queued'}</div>
                <p className="mt-2">
                  {selectedBook?.hasEpub
                    ? 'This book has a built EPUB and an active reader page.'
                    : 'This slot is visible in the selector, but the reader is disabled until the EPUB exists.'}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-dark-alt px-4 py-4">
                <div className="story-metric-value">{selectedBook?.slug ?? featuredBook.slug}</div>
                <p className="mt-2">Use the dedicated route for the stable reading session and saved progress.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
