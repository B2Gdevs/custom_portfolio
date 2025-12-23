'use client';

import Link from 'next/link';
import { Clock, ArrowRight, Edit } from 'lucide-react';
import { format } from 'date-fns';
import type { ContentMeta } from '@/lib/content';

interface RecentDocsProps {
  docs: Array<{ meta: ContentMeta; slug: string }>;
}

export default function RecentDocs({ docs }: RecentDocsProps) {
  // Get most recently updated (first 5, already sorted by updated/date)
  const recentDocs = docs.slice(0, 5);

  if (recentDocs.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={20} className="text-accent" />
        <h3 className="text-lg font-bold text-primary">Recently Updated</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {recentDocs.map((doc) => {
          const updatedDate = doc.meta.updated;
          const createdDate = doc.meta.date;
          const updatedValue = updatedDate ? format(new Date(updatedDate), 'MMM d, yyyy') : null;
          const createdValue = createdDate ? format(new Date(createdDate), 'MMM d, yyyy') : null;
          const hasUpdate = !!updatedDate && updatedDate !== createdDate;
          
          return (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="bg-dark-elevated border border-border rounded-2xl block group hover:border-accent/50 hover:-translate-y-0.5 transition-all"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: hasUpdate 
                  ? 'var(--color-accent)' 
                  : 'var(--color-accent-4)'
              }}
            >
              <div className="p-4">
                <h4 className="font-semibold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
                  {doc.meta.title}
                </h4>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  {updatedValue && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>Updated: {updatedValue}</span>
                    </div>
                  )}
                  {createdValue && hasUpdate && (
                    <div className="flex items-center gap-1.5">
                      <Edit size={12} />
                      <span>Created: {createdValue}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

