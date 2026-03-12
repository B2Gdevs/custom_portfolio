'use client';

import { useEffect, useRef, useState } from 'react';
import { unpackRepub } from './unpack.js';

export interface RepubViewerProps {
  /** URL to fetch .repub from, or ArrayBuffer of .repub contents */
  src: string | ArrayBuffer;
  /** Title for the iframe and loading/error display */
  title?: string;
  /** Optional CSS class for the container */
  className?: string;
}

/**
 * Embeddable .repub reader. Accepts a URL or buffer; unpacks and renders in an iframe.
 * Use in portfolio, docs, or any app that needs to display a .repub without the full Koodo Reader.
 */
export function RepubViewer({ src, title = 'Book', className }: RepubViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const revokeRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (revokeRef.current) {
        revokeRef.current();
        revokeRef.current = null;
      }
      setStatus('loading');
      setErrorMessage(null);
      try {
        let buffer: ArrayBuffer;
        if (typeof src === 'string') {
          const res = await fetch(src);
          if (!res.ok) {
            setErrorMessage(`Failed to load book: ${res.status}`);
            setStatus('error');
            return;
          }
          buffer = await res.arrayBuffer();
        } else {
          buffer = src;
        }
        const { entryUrl, revoke } = await unpackRepub(buffer);
        revokeRef.current = revoke;
        const iframe = iframeRef.current;
        if (!iframe) return;
        iframe.src = entryUrl;
        setStatus('ready');
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : 'Failed to load .repub');
        setStatus('error');
      }
    }

    load();
    return () => {
      if (revokeRef.current) {
        revokeRef.current();
        revokeRef.current = null;
      }
    };
  }, [src]);

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {status === 'loading' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
            }}
          >
            Loading book…
          </div>
        )}
        {status === 'error' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171',
            }}
          >
            {errorMessage}
          </div>
        )}
        <iframe
          ref={iframeRef}
          title={title}
          style={{ width: '100%', height: '100%', border: 0, background: 'white' }}
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
}
