'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';

export default function DocLinkCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description?: string;
}) {
  return (
    <Link
      href={href}
      className="group my-4 flex items-start gap-4 rounded-xl border border-border bg-dark-alt/50 p-4 transition-colors hover:border-accent/50 hover:bg-dark-alt"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-dark">
        <FileText className="text-accent" size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-semibold text-primary group-hover:text-accent">
          {title}
        </span>
        {description && (
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        )}
      </div>
      <ArrowRight className="mt-1 shrink-0 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" size={18} />
    </Link>
  );
}
