'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Briefcase, ExternalLink, Github } from 'lucide-react';

const isAdminEnabled = process.env.NODE_ENV === 'development';

export default function AdminProjectsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
          <h1 className="text-5xl font-bold text-primary">Projects</h1>
          <Link
            href="/admin"
            className="px-4 py-2 bg-dark-alt border border-border rounded-lg hover:bg-dark-elevated transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <p className="text-xl text-text-muted">
          Manage your portfolio projects. Files are stored in <code className="bg-dark-alt px-2 py-1 rounded border border-border">content/projects/</code>
        </p>
      </motion.div>

      <div className="card p-6 mb-6">
        <p className="text-text-muted mb-4">
          <strong>Note:</strong> Projects are currently file-based. To add or edit projects, create or modify MDX files in the <code className="bg-dark-alt px-2 py-1 rounded border border-border">content/projects/</code> directory.
        </p>
        <p className="text-text-muted mb-4">
          Each project should include frontmatter with <code className="bg-dark-alt px-2 py-1 rounded border border-border">title</code>, <code className="bg-dark-alt px-2 py-1 rounded border border-border">description</code>, <code className="bg-dark-alt px-2 py-1 rounded border border-border">images</code>, <code className="bg-dark-alt px-2 py-1 rounded border border-border">featuredImage</code>, and optional <code className="bg-dark-alt px-2 py-1 rounded border border-border">githubUrl</code> and <code className="bg-dark-alt px-2 py-1 rounded border border-border">liveUrl</code>.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-accent hover:underline"
        >
          View Public Projects <ExternalLink size={16} />
        </Link>
      </div>

      <AdminProjectsList />
    </div>
  );
}

function AdminProjectsList() {
  const [projects, setProjects] = useState<Array<{ meta: any; slug: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch projects from API route
    fetch('/api/admin/projects')
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <p className="text-text-muted">Loading projects...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Briefcase size={48} className="mx-auto mb-4 text-text-muted" />
        <p className="text-xl text-text-muted mb-4">No project files found</p>
        <p className="text-text-muted">
          Add MDX files to <code className="bg-dark-alt px-2 py-1 rounded border border-border">content/projects/</code> to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {projects.map((project, index) => (
        <motion.div
          key={project.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card p-6"
        >
          <h3 className="text-2xl font-bold mb-2">{project.meta.title}</h3>
          {project.meta.description && (
            <p className="text-text-muted mb-4 line-clamp-2">{project.meta.description}</p>
          )}
          <div className="flex gap-4 mb-4">
            {project.meta.githubUrl && (
              <a
                href={project.meta.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors"
              >
                <Github size={18} />
                GitHub
              </a>
            )}
            {project.meta.liveUrl && (
              <a
                href={project.meta.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-text-muted hover:text-accent transition-colors"
              >
                <ExternalLink size={18} />
                Live
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/projects/${project.slug}`}
              className="text-accent hover:underline inline-flex items-center gap-2"
            >
              View <ExternalLink size={16} />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

