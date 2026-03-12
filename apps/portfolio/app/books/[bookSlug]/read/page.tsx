import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBookBySlug } from '@/lib/books';
import EpubViewer from '@/components/books/EpubViewerLazy';

export default async function BookReadPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = await params;
  const book = getBookBySlug(bookSlug);
  if (!book || !book.hasEpub) notFound();
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between gap-4 py-3 px-4 border-b border-border bg-dark-alt/80 shrink-0">
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/90"
        >
          <ArrowLeft size={16} />
          Back to Books
        </Link>
        <span className="text-sm text-text-muted truncate">{book.title}</span>
      </div>
      <div className="flex-1 min-h-0 relative bg-dark">
        <EpubViewer
          epubUrl={`/books/${bookSlug}/book.epub`}
          title={book.title}
          storageKey={bookSlug}
          className="h-full"
        />
      </div>
    </div>
  );
}
