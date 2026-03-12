import Link from 'next/link';
import { getBooks } from '@/lib/books';
import { BookOpen, Download, FileText } from 'lucide-react';

export default function BooksPage() {
  const books = getBooks();

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <header className="mb-12 pb-8 border-b border-border">
        <h1 className="text-4xl font-bold text-primary mb-2">Books</h1>
        <p className="text-text-muted">
          Read in the browser or download as EPUB (universal) or RichEPub (.repub) for the full React experience.
        </p>
      </header>

      <div className="grid gap-8">
        {books.length === 0 ? (
          <p className="text-text-muted">No books yet. Add entries in <code className="bg-dark-alt px-2 py-1 rounded border border-border">lib/books.ts</code> and place files under <code className="bg-dark-alt px-2 py-1 rounded border border-border">public/books/</code>.</p>
        ) : (
          books.map((book) => (
            <article
              key={book.slug}
              className="rounded-xl border border-border bg-dark-alt/50 p-6 md:p-8 shadow-lg"
            >
              <h2 className="text-2xl font-semibold text-primary mb-2">{book.title}</h2>
              {book.description && (
                <p className="text-text-muted mb-6">{book.description}</p>
              )}
              <div className="flex flex-wrap gap-3">
                {book.hasRepub && (
                  <>
                    <Link
                      href={`/books/${book.slug}/read`}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                    >
                      <BookOpen size={16} />
                      Read (RichEPub)
                    </Link>
                    <a
                      href={`/books/${book.slug}/book.repub`}
                      download={`${book.slug}.repub`}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-dark-alt px-4 py-2 text-sm font-medium text-primary hover:bg-dark-alt/80 transition"
                    >
                      <Download size={16} />
                      Download RichEPub
                    </a>
                  </>
                )}
                {book.hasEpub && (
                  <a
                    href={`/books/${book.slug}/book.epub`}
                    download={`${book.slug}.epub`}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-dark-alt px-4 py-2 text-sm font-medium text-primary hover:bg-dark-alt/80 transition"
                  >
                    <FileText size={16} />
                    Download EPUB
                  </a>
                )}
              </div>
              {/* Placeholder for future enhancements: theme, font size, bookmarks */}
              <div className="mt-6 pt-6 border-t border-border/50 text-xs text-text-muted">
                <span className="opacity-70">Placeholder: theme, font size, and bookmarks (coming soon).</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
