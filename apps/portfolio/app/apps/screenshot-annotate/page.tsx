'use client';

import dynamic from 'next/dynamic';

const ScreenshotAnnotateApp = dynamic(
  () => import('@/components/screenshot-annotate/ScreenshotAnnotateApp'),
  { ssr: false, loading: () => <div className="p-8 text-sm text-text-muted">Loading editor…</div> },
);

export default function ScreenshotAnnotatePage() {
  return <ScreenshotAnnotateApp />;
}
