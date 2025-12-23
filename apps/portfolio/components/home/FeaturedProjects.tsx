'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface FeaturedProjectsProps {
  projects: Array<{
    meta: {
      title: string;
      description?: string;
      featuredImage?: string;
      images?: string[];
      tags?: string[];
    };
    slug: string;
  }>;
}

export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-5 mt-6">
      {projects.map((project, i) => {
        const featuredImage = project.meta.featuredImage || project.meta.images?.[0] || '/images/projects/bashful/featured.svg';
        const tags = project.meta.tags || [];
        return (
          <motion.div
            key={project.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="bg-dark-elevated border border-border rounded-2xl group overflow-hidden hover:shadow-xl hover:border-border-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="relative h-56 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
              {featuredImage && (
                <Image
                  src={featuredImage}
                  alt={project.meta.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-2xl font-bold text-white mb-2">{project.meta.title}</h3>
                <div className="flex gap-2 flex-wrap">
                  {tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white border border-white/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-white/80 mb-3 leading-relaxed">{project.meta.description}</p>
              <Link
                href={`/projects/${project.slug}`}
                className="inline-flex items-center text-accent font-medium text-sm hover:gap-2 transition-all group/link"
              >
                Learn more <ArrowRight size={14} className="ml-1.5 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}



