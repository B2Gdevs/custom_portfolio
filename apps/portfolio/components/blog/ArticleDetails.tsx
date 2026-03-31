'use client';

import React from 'react';

export function ArticleDetails({
  summary,
  children,
}: {
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group/details my-8 rounded-2xl border border-border/80 bg-dark-alt/40 open:bg-dark-alt/55">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-primary [&::-webkit-details-marker]:hidden">
        <span>{summary}</span>
        <span className="shrink-0 text-text-muted transition-transform duration-200 group-open/details:-rotate-180">▼</span>
      </summary>
      <div className="border-t border-border/60 px-5 py-5 prose prose-lg max-w-none text-text prose-headings:text-primary">
        {children}
      </div>
    </details>
  );
}
