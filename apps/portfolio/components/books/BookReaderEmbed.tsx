'use client';

import { useEffect, useState } from 'react';
import { RepubViewer } from '@portfolio/repub-reader';
import type { BookEntry } from '@/lib/books';

interface BookReaderEmbedProps {
  /** Book slug (e.g. mordreds_tale). Reads from static /books/<slug>/book.repub and book.epub */
  slug: string;
  /** Optional title; if not set, fetched from /books/manifest.json */
  title?: string;
}

/**
 * Embeds the RichEPub reader in docs/articles. Reads from static files
 * at /books/<slug>/book.repub. Download links use /books/<slug>/book.epub and book.repub.
 */
export default function BookReaderEmbed({ slug, title: titleProp }: BookReaderEmbedProps) {
  const [title, setTitle] = useState<string>(titleProp ?? slug);
  const [loading, setLoading] = useState(!titleProp);

  useEffect(() => {
    if (titleProp) return;
    let cancelled = false;
    fetch('/books/manifest.json')
      .then((r) => r.ok ? r.json() : [])
      .then((list: BookEntry[]) => {
        if (cancelled) return;
        const book = list.find((b) => b.slug === slug);
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
      <div className="my-8 rounded-lg border border-border bg-dark-alt p-8 text-center text-text-muted">
        Loading reader…
      </div>
    );
  }

  return (
    <div className="my-8 rounded-lg border border-border overflow-hidden">
      <div className="min-h-[400px]">
        <RepubViewer src={`/books/${slug}/book.repub`} title={title} className="min-h-[400px]" />
      </div>
      <div className="flex flex-wrap gap-3 p-3 border-t border-border bg-dark-alt/50 text-sm">
        <a
          href={`/books/${slug}/book.epub`}
          download={`${slug}.epub`}
          className="text-primary hover:underline"
        >
          Download EPUB
        </a>
        <span className="text-border">|</span>
        <a
          href={`/books/${slug}/book.repub`}
          download={`${slug}.repub`}
          className="text-primary hover:underline"
        >
          Download RichEPub
        </a>
      </div>
    </div>
  );
}
