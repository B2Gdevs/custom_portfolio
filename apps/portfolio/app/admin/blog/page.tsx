'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, ExternalLink } from 'lucide-react';

const isAdminEnabled = process.env.NODE_ENV === 'development';

export default function AdminBlogPage() {
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<Array<{ meta: any; slug: string }>>([]);

  useEffect(() => {
    setMounted(true);
    if (isAdminEnabled) {
      fetch('/api/admin/blog')
        .then((res) => res.json())
        .then((data) => setPosts(data))
        .catch(() => {
          setPosts([]);
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
          <h1 className="text-5xl font-bold text-primary">Blog Posts</h1>
          <Link
            href="/admin"
            className="px-4 py-2 bg-dark-alt border border-border rounded-lg hover:bg-dark-elevated transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <p className="text-xl text-text-muted">
          Manage your blog posts. Files are stored in <code className="bg-dark-alt px-2 py-1 rounded border border-border">content/blog/</code>
        </p>
      </motion.div>

      <div className="card p-6 mb-6">
        <p className="text-text-muted mb-4">
          <strong>Note:</strong> Blog posts are currently file-based. To add or edit posts, create or modify MDX files in the <code className="bg-dark-alt px-2 py-1 rounded border border-border">content/blog/</code> directory.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-accent hover:underline"
        >
          View Public Blog <ExternalLink size={16} />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-text-muted" />
            <p className="text-xl text-text-muted mb-4">No blog posts found</p>
            <p className="text-text-muted">
              Add MDX files to <code className="bg-dark-alt px-2 py-1 rounded border border-border">content/blog/</code> to get started.
            </p>
          </div>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <h3 className="text-2xl font-bold mb-2">{post.meta.title}</h3>
              {post.meta.description && (
                <p className="text-text-muted mb-4 line-clamp-2">{post.meta.description}</p>
              )}
              {post.meta.date && (
                <p className="text-sm text-text-muted mb-4">
                  {new Date(post.meta.date).toLocaleDateString()}
                </p>
              )}
              <Link
                href={`/blog/${post.slug}`}
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

