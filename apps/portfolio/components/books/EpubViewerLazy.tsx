'use client';

import dynamic from 'next/dynamic';
import type { EpubViewerProps } from './EpubViewer';

/**
 * Client-only EPUB viewer. Loads react-reader (epub.js) only in the browser.
 */
const EpubViewer = dynamic<EpubViewerProps>(
  () => import('./EpubViewer').then((m) => m.default),
  { ssr: false }
);

export default EpubViewer;
