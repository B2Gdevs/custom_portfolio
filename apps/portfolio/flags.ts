import { flag } from '@vercel/flags/next';

/**
 * When **true**: `/api/published-book-artifacts/file/*` does not redirect to
 * `public/books/<slug>/book.epub`; delivery is Payload/S3 (and manifest `remoteEpubUrl`) only.
 *
 * **Vercel:** set `FLAGS_SECRET` (32 bytes, base64url) for Toolbar overrides — see
 * [@vercel/flags README](https://www.npmjs.com/package/@vercel/flags). Toggle in the Vercel Flags UI
 * or set env `DISABLE_STATIC_PUBLISHED_BOOK_EPUB_FALLBACK=1` (and optionally
 * `NEXT_PUBLIC_DISABLE_STATIC_PUBLISHED_BOOK_EPUB_FALLBACK=1` so client components match).
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
