'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Briefcase, BookOpen } from 'lucide-react';
import Link from 'next/link';

// Only allow admin in development
const isAdminEnabled = process.env.NODE_ENV === 'development';

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ projects: 0, blog: 0, docs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch('/api/admin/projects').then((r) => r.json()).catch(() => []),
      fetch('/api/admin/blog').then((r) => r.json()).catch(() => []),
      fetch('/api/admin/docs').then((r) => r.json()).catch(() => []),
    ]).then(([projects, blog, docs]) => {
      setStats({
        projects: Array.isArray(projects) ? projects.length : 0,
        blog: Array.isArray(blog) ? blog.length : 0,
        docs: Array.isArray(docs) ? docs.length : 0,
      });
      setLoading(false);
    });
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

  const adminSections = [
    {
      title: 'Projects',
      icon: Briefcase,
      href: '/admin/projects',
      description: 'Manage your portfolio projects',
      color: 'bg-accent',
      count: stats.projects,
    },
    {
      title: 'Blog Posts',
      icon: FileText,
      href: '/admin/blog',
      description: 'Create and edit blog posts',
      color: 'bg-accent2',
      count: stats.blog,
    },
    {
      title: 'Documentation',
      icon: BookOpen,
      href: '/admin/docs',
      description: 'Manage documentation pages',
      color: 'bg-accent3',
      count: stats.docs,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-bold text-primary mb-4">Admin Dashboard</h1>
        <p className="text-xl text-text-muted">
          Manage your content, projects, and documentation
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {adminSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={section.href}
                className={`${section.color} p-8 text-primary block rounded-2xl border-2 border-border hover:border-border-hover hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
              >
                <Icon size={48} className="mb-4" />
                <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                <p className="opacity-90 mb-3">{section.description}</p>
                <div className="text-3xl font-bold">
                  {loading ? '...' : section.count}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


