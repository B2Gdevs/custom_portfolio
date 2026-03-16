import Link from 'next/link';
import { getBooks } from '@/lib/books';
import { BookOpen, Download } from 'lucide-react';

export default function BooksPage() {
  const books = getBooks();

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <header className="mb-12 border-b border-border pb-8">
        <p className="section-kicker">Read</p>
        <h1 className="font-display text-5xl text-primary md:text-6xl">Books and reading editions</h1>
        <p className="mt-4 text-lg text-text-muted">
          Open the browser reader or pull the EPUB into your own reading stack.
        </p>
      </header>

      <div className="grid gap-8">
        {books.length === 0 ? (
          <p className="text-text-muted">No books yet. Add entries in <code className="bg-dark-alt px-2 py-1 rounded border border-border">lib/books.ts</code> and place files under <code className="bg-dark-alt px-2 py-1 rounded border border-border">public/books/</code>.</p>
        ) : (
          books.map((book) => (
            <article
              key={book.slug}
              className="story-card p-6 md:p-8"
            >
              <p className="section-kicker">Edition ready</p>
              <h2 className="mt-2 font-display text-3xl text-primary">{book.title}</h2>
              {book.description && (
                <p className="mb-6 mt-4 text-text-muted">{book.description}</p>
              )}
              <div className="flex flex-wrap gap-3">
                {book.hasEpub && (
                  <>
                    <Link
                      href={`/books/${book.slug}/read`}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-secondary transition hover:opacity-90"
                    >
                      <BookOpen size={16} />
                      Read
                    </Link>
                    <a
                      href={`/books/${book.slug}/book.epub`}
                      download={`${book.slug}.epub`}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-dark px-4 py-2 text-sm font-medium text-primary transition hover:border-accent hover:text-accent"
                    >
                      <Download size={16} />
                      Download EPUB
                    </a>
                  </>
                )}
              </div>
              <div className="mt-6 border-t border-border/50 pt-6 text-xs text-text-muted">
                <span className="opacity-70">Reader preview, download, and world-building notes will keep expanding here.</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
