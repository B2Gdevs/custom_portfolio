'use client';

import { useEffect } from 'react';

/**
 * Root error boundary (replaces root layout on failure). Must define html/body.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global-error]', error.message, error.digest ?? '', error.stack ?? '');
  }, [error]);

  const showDetail =
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_CLIENT_ERROR_DEBUG === '1';

  return (
    <html lang="en" className="dark">
      <body className="min-h-svh bg-background font-sans text-foreground">
        <div className="mx-auto max-w-lg px-6 py-16">
          <h1 className="font-display text-2xl text-primary">Application error</h1>
          <p className="mt-3 text-text-muted">
            {error.digest ? (
              <>
                Reference{' '}
                <code className="rounded bg-dark-alt px-1 py-0.5 text-primary">{error.digest}</code> — check
                Vercel runtime logs for this digest.
              </>
            ) : (
              'A critical error occurred while rendering the app shell.'
            )}
          </p>
          {showDetail ? (
            <pre className="mt-4 max-h-48 overflow-auto rounded border border-border bg-dark-alt/50 p-3 text-xs text-text-muted">
              {error.message}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 rounded-full border border-border px-4 py-2 text-sm text-primary transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
