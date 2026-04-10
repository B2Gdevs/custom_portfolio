import { flag } from 'flags/next';

/**
 * When **true**: `/api/published-book-artifacts/file/*` does not redirect to
 * `public/books/<slug>/book.epub`; delivery is Payload/S3 (and manifest `remoteEpubUrl`) only.
 *
 * **Vercel:** same key in the dashboard (`disable-static-published-book-epub-fallback`). On Vercel,
 * set `FLAGS` / `FLAGS_SECRET` from the project (see [Vercel Flags quickstart](https://vercel.com/docs/flags/vercel-flags/quickstart)).
 * Env fallbacks for CI/local: `DISABLE_STATIC_PUBLISHED_BOOK_EPUB_FALLBACK=1`,
 * `NEXT_PUBLIC_DISABLE_STATIC_PUBLISHED_BOOK_EPUB_FALLBACK=1`.
 */
export const disableStaticPublishedBookEpubFallback = flag<boolean>({
  key: 'disable-static-published-book-epub-fallback',
  description:
    'Disable redirect/fallback to static /books/<slug>/book.epub; use published artifacts (S3/Payload) only.',
  options: [
    { label: 'Off — allow static fallback', value: false },
    { label: 'On — S3 / manifest URLs only', value: true },
  ],
  defaultValue: false,
  decide() {
    return (
      process.env.DISABLE_STATIC_PUBLISHED_BOOK_EPUB_FALLBACK === '1' ||
      process.env.NEXT_PUBLIC_DISABLE_STATIC_PUBLISHED_BOOK_EPUB_FALLBACK === '1'
    );
  },
});
