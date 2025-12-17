'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import type { ContentMeta } from '@/lib/content';

interface ProjectsGridProps {
  projects: Array<{ meta: ContentMeta; slug: string }>;
}

export default function ProjectsGrid({ projects }: ProjectsGridProps) {
  if (projects.length === 0) {
    return (
      <div className="bg-dark-elevated border border-border rounded-2xl p-12 text-center">
        <p className="text-xl text-green-300 mb-4">No projects yet.</p>
        <p className="text-green-300">
          Add MDX files to <code className="bg-dark-alt px-2 py-1 rounded border border-border">content/projects/</code> to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {projects.map((project, index) => {
        const thumbnail = project.meta.featuredImage || project.meta.images?.[0];
        return (
        <motion.div
          key={project.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-dark-elevated border border-border rounded-2xl group overflow-hidden hover:border-border-hover hover:-translate-y-0.5 transition-all"
        >
          {thumbnail && (
            <div className="relative w-full h-48 overflow-hidden">
              <Image
                src={thumbnail}
                alt={project.meta.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="p-6">
            <h2 className="text-3xl font-bold mb-3 group-hover:text-accent transition-colors">{project.meta.title}</h2>
            {project.meta.description && (
              <p className="text-lg text-green-200 mb-6">{project.meta.description}</p>
            )}
            <div className="flex gap-4 mb-6">
              {project.meta.githubUrl && (
                <a
                  href={project.meta.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
                >
                  <Github size={20} />
                  GitHub
                </a>
              )}
              {project.meta.liveUrl && (
                <a
                  href={project.meta.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
                >
                  <ExternalLink size={20} />
                  Live Demo
                </a>
              )}
            </div>
            <Link
              href={`/projects/${project.slug}`}
              className="bg-gradient-to-r from-accent to-accent-3 text-white font-semibold rounded-xl px-5 py-2.5 inline-flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Read More
            </Link>
          </div>
        </motion.div>
        );
      })}
    </div>
  );
}

