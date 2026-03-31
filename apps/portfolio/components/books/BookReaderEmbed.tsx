'use client';

import { useEffect, useState } from 'react';
import { EpubViewerLazy } from '@portfolio/repub-builder/reader';
import { getPublishedBookDownloadUrl } from '@/lib/book-artifacts';
import type { BookEntry } from '@/lib/books';

interface BookReaderEmbedProps {
  slug: string;
  title?: string;
  /** Frozen checkpoint artifact: `/books/<slug>/checkpoints/<checkpoint>/book.epub` (not overwritten by later builds). */
  checkpoint?: string;
  containerClassName?: string;
  viewerClassName?: string;
  showDownloadLink?: boolean;
}

export default function BookReaderEmbed({
  slug,
  title: titleProp,
  checkpoint,
  containerClassName = 'my-8 overflow-hidden rounded-lg border border-border',
  viewerClassName = 'min-h-[400px]',
  showDownloadLink = true,
}: BookReaderEmbedProps) {
  const suffix = checkpoint ? ` (checkpoint ${checkpoint})` : '';
  const [title, setTitle] = useState<string>(
    titleProp ? `${titleProp}${suffix}` : slug,
  );
  const [loading, setLoading] = useState(!titleProp);
  const fallbackEpubPath = checkpoint
    ? `/books/${slug}/checkpoints/${checkpoint}/book.epub`
    : `/books/${slug}/book.epub`;
  const [epubPath, setEpubPath] = useState(fallbackEpubPath);
  const storageKey = checkpoint ? `${slug}__${checkpoint}` : slug;

  useEffect(() => {
    let cancelled = false;

    fetch('/books/manifest.json')
      .then((response) => (response.ok ? response.json() : []))
      .then((list: BookEntry[]) => {
        if (cancelled) return;
        const book = list.find((entry) => entry.slug === slug);
        const base = book?.title ?? slug;
        if (!titleProp) {
          setTitle(checkpoint ? `${base}${suffix}` : base);
        }
        if (!checkpoint) {
          setEpubPath(
            getPublishedBookDownloadUrl({
              slug,
              remoteEpubUrl: book?.remoteEpubUrl ?? null,
            }),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fallbackEpubPath, slug, titleProp, checkpoint, suffix]);

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
        <EpubViewerLazy
          epubUrl={epubPath}
          title={title}
          storageKey={storageKey}
          className={viewerClassName}
        />
      </div>
      {showDownloadLink && (
        <div className="flex flex-wrap gap-3 border-t border-border bg-dark-alt/50 p-3 text-sm">
          <a
            href={epubPath}
            download={`${slug}${checkpoint ? `-${checkpoint}` : ''}.epub`}
            className="text-primary hover:underline"
          >
            Download EPUB
          </a>
        </div>
      )}
    </div>
  );
}
