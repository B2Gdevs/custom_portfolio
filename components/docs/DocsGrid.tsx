'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Edit } from 'lucide-react';
import { format } from 'date-fns';
import type { ContentMeta } from '@/lib/content';

interface DocsGridProps {
  docs: Array<{ meta: ContentMeta; slug: string }>;
  showRecent?: boolean;
}

export default function DocsGrid({ docs, showRecent = false }: DocsGridProps) {
  if (docs.length === 0) {
    return (
      <div className="bg-dark-elevated border border-border rounded-2xl p-12 text-center">
        <p className="text-xl text-green-300 mb-4">No documentation yet.</p>
        <p className="text-green-300">
          Add MDX files to <code className="bg-dark-alt px-2 py-1 rounded border border-border">content/docs/</code> to get started.
        </p>
      </div>
    );
  }

  const displayDocs = showRecent ? docs.slice(0, 6) : docs;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {displayDocs.map((doc, index) => {
        const date = doc.meta.updated || doc.meta.date;
        const dateLabel = doc.meta.updated ? 'Updated' : 'Created';
        const dateValue = date ? format(new Date(date), 'MMM d, yyyy') : null;

        return (
          <motion.div
            key={doc.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/docs/${doc.slug}`}
              className="bg-dark-elevated border border-border rounded-2xl block group hover:border-accent/50 hover:-translate-y-0.5 transition-all"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">
                  {doc.meta.title}
                </h2>
                {doc.meta.description && (
                  <p className="text-green-200 mb-4 leading-relaxed">
                    {doc.meta.description}
                  </p>
                )}
                {dateValue && (
                  <div className="flex items-center gap-4 text-sm text-green-300 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>{dateLabel}: {dateValue}</span>
                    </div>
                    {doc.meta.updated && doc.meta.date && (
                      <div className="flex items-center gap-1.5">
                        <Edit size={14} />
                        <span>Created: {format(new Date(doc.meta.date), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more <ArrowRight size={16} className="ml-2" />
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

