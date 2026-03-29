'use client';

import Link from 'next/link';
import { ArrowUpRight, BookOpen, Clock3 } from 'lucide-react';
import type { BookEntry } from '@/lib/books';
import { readerAppHref } from '@/lib/reader-routes';
import type { ReaderShelfStatus } from '@/lib/reader-progress';
import { ReaderEmptyCover } from '@/components/books/ReaderEmptyCover';

function statusClasses(kind: ReaderShelfStatus['kind']) {
  switch (kind) {
    case 'done':
      return 'border-emerald-400/28 bg-emerald-400/12 text-emerald-100';
    case 'progress':
      return 'border-[rgba(213,176,131,0.4)] bg-[rgba(213,176,131,0.16)] text-[#fff3e5]';
    case 'coming-soon':
      return 'border-[rgba(140,102,67,0.22)] bg-[rgba(255,255,255,0.03)] text-[rgba(236,223,204,0.72)]';
    default:
      return 'border-sky-300/24 bg-sky-300/12 text-sky-100';
  }
}

export function ReaderShelfCard({
  book,
  status,
  isActive,
}: {
  book: BookEntry;
  status: ReaderShelfStatus;
  isActive: boolean;
}) {
  const canOpen = book.hasEpub;
  const href = readerAppHref({ book: book.slug });
  const description =
    book.description?.trim() || 'A built-in reading edition is prepared for the in-browser reader workspace.';

  const cardClassName = `group flex h-full flex-col rounded-[1.8rem] border p-4 transition duration-200 ${
    isActive
      ? 'border-[rgba(213,176,131,0.42)] bg-[rgba(255,255,255,0.06)] shadow-[0_18px_48px_rgba(0,0,0,0.24)]'
      : 'border-[rgba(140,102,67,0.18)] bg-[rgba(255,255,255,0.03)] hover:border-[rgba(213,176,131,0.32)] hover:bg-[rgba(255,255,255,0.05)]'
  }`;

  const cover = (
    <div className="relative aspect-[11/16] overflow-hidden rounded-[1.4rem]">
      {book.coverImage ? (
        <img
          src={book.coverImage}
          alt={`${book.title} cover`}
          className="h-full w-full object-cover"
        />
      ) : (
        <ReaderEmptyCover title={book.title} />
      )}
      <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${statusClasses(status.kind)}`}>
          {status.label}
        </span>
        {canOpen ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(15,10,8,0.55)] text-[#fff3e5] shadow-[0_8px_18px_rgba(0,0,0,0.16)]">
            <ArrowUpRight size={14} />
          </span>
        ) : null}
      </div>
    </div>
  );

  const inner = (
    <>
      {cover}
      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[1.35rem] leading-tight text-[#fff3e5]">{book.title}</h2>
            <p className="mt-1 text-sm text-[rgba(236,223,204,0.72)]">
              {book.author?.trim() || 'Portfolio edition'}
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-[rgba(140,102,67,0.2)] bg-[rgba(0,0,0,0.16)] px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-[rgba(213,176,131,0.78)]">
            {book.hasEpub ? 'Built in' : 'Queued'}
          </div>
        </div>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-[rgba(236,223,204,0.68)]">{description}</p>
        <div className="mt-4 flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.16em] text-[rgba(213,176,131,0.72)]">
          {book.hasEpub ? <BookOpen size={13} /> : <Clock3 size={13} />}
          <span>{book.hasEpub ? 'Open in reader workspace' : 'Reading build not emitted yet'}</span>
        </div>
      </div>
    </>
  );

  if (!canOpen) {
    return <article className={`${cardClassName} opacity-90`}>{inner}</article>;
  }

  return (
    <Link href={href} className={cardClassName}>
      {inner}
    </Link>
  );
}
