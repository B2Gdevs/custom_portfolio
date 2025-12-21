'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { ContentMeta } from '@/lib/content';

interface BlogListProps {
  posts: Array<{
    meta: ContentMeta;
    slug: string;
  }>;
}

export default function BlogList({ posts }: BlogListProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-bold text-primary mb-4">Blog</h1>
        <p className="text-xl text-text-muted">
          Thoughts, learnings, and insights on software development
        </p>
      </motion.div>

      {posts.length === 0 ? (
        <div className="brutal-border bg-dark-alt p-12 text-center">
          <p className="text-xl text-text-muted mb-4">No blog posts yet.</p>
          <p className="text-text-muted">
            Add MDX files to <code className="bg-dark px-2 py-1 border border-primary">content/blog/</code> to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="brutal-border bg-secondary p-6"
            >
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-3xl font-bold mb-3 hover:text-accent transition-colors">
                  {post.meta.title}
                </h2>
              </Link>
              {post.meta.date && (
                <time className="text-text-muted text-sm block mb-3">
                  {format(new Date(post.meta.date), 'MMMM d, yyyy')}
                </time>
              )}
              {post.meta.description && (
                <p className="text-lg text-text-muted mb-4">{post.meta.description}</p>
              )}
              {post.meta.tags && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {post.meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="brutal-border bg-dark-alt px-3 py-1 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <Link
                href={`/blog/${post.slug}`}
                className="text-accent font-semibold hover:underline inline-flex items-center gap-2"
              >
                Read more →
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}


