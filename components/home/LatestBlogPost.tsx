'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getPCBPatternPath, type PCBPattern } from '@/lib/pcb-patterns';

interface LatestBlogPostProps {
  post: {
    meta: {
      title: string;
      description?: string;
      date?: string;
      tags?: string[];
    };
    slug: string;
  } | null;
  pattern?: PCBPattern;
}

export default function LatestBlogPost({ post, pattern = 'curves' }: LatestBlogPostProps) {
  if (!post) return null;

  return (
    <section className="w-full relative overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("${getPCBPatternPath(pattern)}")`,
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '500px 400px',
          opacity: 0.5,
        }}
      />
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14 relative z-10">
        <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">
            Latest <span className="gradient-text">Blog Post</span>
          </h2>
          <p className="text-base text-white/80 max-w-2xl mx-auto">
            Insights on building scalable systems and shipping products
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-dark-elevated border border-border rounded-2xl group overflow-hidden hover:shadow-xl hover:border-border-hover hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4">
              {post.meta.tags && post.meta.tags.length > 0 && (
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                  {post.meta.tags[0]}
                </span>
              )}
              {post.meta.date && (
                <span className="text-sm text-white/70">
                  {new Date(post.meta.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold mb-3 group-hover:text-accent transition-colors">{post.meta.title}</h3>
            {post.meta.description && (
              <p className="text-lg text-white mb-6 leading-relaxed">{post.meta.description}</p>
            )}
            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center text-accent font-semibold hover:gap-2 transition-all group/link"
            >
              Read more <ArrowRight size={18} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="bg-dark-elevated text-white border border-border rounded-xl px-5 py-2.5 font-semibold inline-flex items-center gap-2 hover:border-accent hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            View All Posts
            <ArrowRight size={16} />
          </Link>
        </div>
        </div>
      </div>
    </section>
  );
}



