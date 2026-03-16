'use client';

import { useEffect, useState } from 'react';
import type { BookEntry } from '@/lib/books';
import EpubViewer from '@/components/books/EpubViewerLazy';

interface BookReaderEmbedProps {
  slug: string;
  title?: string;
  containerClassName?: string;
  viewerClassName?: string;
  showDownloadLink?: boolean;
}

export default function BookReaderEmbed({
  slug,
  title: titleProp,
  containerClassName = 'my-8 overflow-hidden rounded-lg border border-border',
  viewerClassName = 'min-h-[400px]',
  showDownloadLink = true,
}: BookReaderEmbedProps) {
  const [title, setTitle] = useState<string>(titleProp ?? slug);
  const [loading, setLoading] = useState(!titleProp);

  useEffect(() => {
    if (titleProp) return;

    let cancelled = false;

    fetch('/books/manifest.json')
      .then((response) => (response.ok ? response.json() : []))
      .then((list: BookEntry[]) => {
        if (cancelled) return;
        const book = list.find((entry) => entry.slug === slug);
        setTitle(book?.title ?? slug);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, titleProp]);

  if (loading) {
    return (
      <div className={`${containerClassName} bg-dark-alt p-8 text-center text-text-muted`}>
        Loading reader...
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      <div className={viewerClassName}>
        <EpubViewer
          epubUrl={`/books/${slug}/book.epub`}
          title={title}
          storageKey={slug}
          className={viewerClassName}
        />
      </div>
      {showDownloadLink && (
        <div className="flex flex-wrap gap-3 border-t border-border bg-dark-alt/50 p-3 text-sm">
          <a
            href={`/books/${slug}/book.epub`}
            download={`${slug}.epub`}
            className="text-primary hover:underline"
          >
            Download EPUB
          </a>
        </div>
      )}
    </div>
  );
}
