'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RepubViewer as RepubViewerSDK } from '@portfolio/repub-reader';

interface RepubViewerProps {
  bookSlug: string;
  bookTitle: string;
}

/**
 * Portfolio book reader page: uses embeddable repub-reader SDK with Back to Books header.
 */
export default function RepubViewer({ bookSlug, bookTitle }: RepubViewerProps) {
  const repubUrl = `/books/${bookSlug}/book.repub`;

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
        <span className="text-sm text-text-muted truncate">{bookTitle}</span>
      </div>
      <div className="flex-1 min-h-0 relative bg-dark">
        <RepubViewerSDK
          src={repubUrl}
          title={bookTitle}
          className="h-full"
        />
      </div>
    </div>
  );
}
