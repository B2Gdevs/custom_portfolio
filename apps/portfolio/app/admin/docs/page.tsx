'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, ExternalLink } from 'lucide-react';

const isAdminEnabled = process.env.NODE_ENV === 'development';

export default function AdminDocsPage() {
  const [mounted, setMounted] = useState(false);
  const [docs, setDocs] = useState<Array<{ meta: any; slug: string }>>([]);

  useEffect(() => {
    setMounted(true);
    if (isAdminEnabled) {
      fetch('/api/admin/docs')
        .then((res) => res.json())
        .then((data) => setDocs(data))
        .catch(() => {
          // Fallback: show message that API needs to be implemented
          setDocs([]);
        });
    }
  }, []);

  if (!mounted) return null;

  if (!isAdminEnabled) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="brutal-border bg-accent p-8 text-secondary">
          <h1 className="text-4xl font-bold mb-4">Admin Disabled</h1>
          <p className="text-lg">
            Admin interface is only available in development mode for security.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-5xl font-bold text-primary">Documentation</h1>
          <Link
            href="/admin"
            className="px-4 py-2 bg-dark-alt border border-border rounded-lg hover:bg-dark-elevated transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <p className="text-xl text-text-muted">
          Manage your documentation pages. Files are stored in <code className="bg-dark-alt px-2 py-1 rounded border border-border">content/docs/</code>
        </p>
      </motion.div>

      <div className="bg-dark-elevated border border-border rounded-2xl p-6 mb-6">
        <p className="text-text-muted mb-4">
          <strong>Note:</strong> Documentation is currently file-based. To add or edit docs, create or modify MDX files in the <code className="bg-dark-alt px-2 py-1 rounded border border-border">content/docs/</code> directory.
        </p>
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-accent hover:underline"
        >
          View Public Documentation <ExternalLink size={16} />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.length === 0 ? (
          <div className="col-span-full bg-dark-elevated border border-border rounded-2xl p-12 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-text-muted" />
            <p className="text-xl text-text-muted mb-4">No documentation files found</p>
            <p className="text-text-muted">
              Add MDX files to <code className="bg-dark-alt px-2 py-1 rounded border border-border">content/docs/</code> to get started.
            </p>
          </div>
        ) : (
          docs.map((doc, index) => (
            <motion.div
              key={doc.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-elevated border border-border rounded-2xl p-6"
            >
              <h3 className="text-2xl font-bold mb-2">{doc.meta.title}</h3>
              {doc.meta.description && (
                <p className="text-text-muted mb-4">{doc.meta.description}</p>
              )}
              <Link
                href={`/docs/${doc.slug}`}
                className="text-accent hover:underline inline-flex items-center gap-2"
              >
                View <ExternalLink size={16} />
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

