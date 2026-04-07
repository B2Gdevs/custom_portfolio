'use client';

import { useEffect, useRef } from 'react';

const REDOC_SCRIPT_SRC = 'https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js';

function loadRedocScriptOnce(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${REDOC_SCRIPT_SRC}"]`);
  if (existing) {
    return existing.dataset.loaded === '1'
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', () => reject(new Error('Redoc script failed')), {
            once: true,
          });
        });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = REDOC_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = '1';
      resolve();
    };
    script.onerror = () => reject(new Error('Redoc script failed to load'));
    document.body.appendChild(script);
  });
}

/**
 * Redoc (OpenAPI) — official standalone bundle from CDN so we do not ship Swagger UI or a large
 * `redoc` npm tree in the Next bundle. Requires network access to `cdn.redoc.ly` (allow in CSP if you add one).
 */
export function ApiDocsRedoc() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = '';
    const redoc = document.createElement('redoc');
    redoc.setAttribute('spec-url', '/api/openapi');
    redoc.setAttribute('theme', 'dark');
    host.appendChild(redoc);

    void loadRedocScriptOnce().catch(() => {
      host.innerHTML =
        '<p class="p-6 text-sm text-amber-400">Could not load API documentation (Redoc script). Check your network or try again.</p>';
    });

    return () => {
      host.innerHTML = '';
    };
  }, []);

  return (
    <div className="api-docs-redoc w-full px-2 pb-8 md:px-4 [&_.redoc-wrap]:bg-transparent">
      <div ref={hostRef} className="min-h-[calc(100vh-14rem)] w-full" />
    </div>
  );
}
