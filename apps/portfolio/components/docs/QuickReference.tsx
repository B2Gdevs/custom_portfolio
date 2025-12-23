'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface QuickReferenceProps {
  currentSlug?: string;
}

const quickLinks = {
  'Book Editor': [
    { title: 'Overview', href: '/docs/book-editor/overview' },
    { title: 'Architecture Guide', href: '/docs/book-editor/architecture-guide' },
    { title: 'Quick Reference', href: '/docs/book-editor/quick-reference' },
    { title: 'Task Plan', href: '/docs/book-editor/task-plan' },
    { title: 'Database Schema', href: '/docs/book-editor/database-schema' },
    { title: 'Tech Stack', href: '/docs/book-editor/tech-stack-final' },
  ],
  'Implementation': [
    { title: 'Auth Options', href: '/docs/book-editor/auth-options' },
    { title: 'File Uploads', href: '/docs/book-editor/file-uploads' },
    { title: 'File Uploads (Detailed)', href: '/docs/book-editor/file-uploads-detailed' },
    { title: 'Collaboration Setup', href: '/docs/book-editor/collaboration-implementation' },
    { title: 'TipTap Data Handling', href: '/docs/book-editor/tiptap-data-handling' },
    { title: 'Highlighting System', href: '/docs/book-editor/highlighting-implementation' },
    { title: 'Next.js Architecture', href: '/docs/book-editor/nextjs-architecture' },
    { title: 'Conflict Resolution', href: '/docs/book-editor/conflict-resolution' },
  ],
  'System': [
    { title: 'MDX Parser', href: '/docs/mdx-parser' },
    { title: 'Architecture', href: '/docs/architecture' },
    { title: 'Getting Started', href: '/docs/getting-started' },
  ],
};

export default function QuickReference({ currentSlug }: QuickReferenceProps) {
  const [expanded, setExpanded] = useState<string | null>('Book Editor');

  return (
    <div className="bg-dark-elevated border border-border rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen size={20} className="text-accent" />
        <h3 className="text-lg font-bold text-primary">Quick Reference</h3>
      </div>
      
      <div className="space-y-3">
        {Object.entries(quickLinks).map(([category, links]) => (
          <div key={category}>
            <button
              onClick={() => setExpanded(expanded === category ? null : category)}
              className="w-full flex items-center justify-between text-left font-semibold text-primary hover:text-accent transition-colors py-2"
            >
              <span>{category}</span>
              {expanded === category ? (
                <ChevronUp size={16} className="text-text-muted" />
              ) : (
                <ChevronDown size={16} className="text-text-muted" />
              )}
            </button>
            
            {expanded === category && (
              <ul className="ml-4 space-y-2 mt-2">
                {links.map((link) => {
                  const isActive = currentSlug === link.href.replace('/docs/', '');
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`block text-sm transition-colors ${
                          isActive
                            ? 'text-accent font-medium'
                            : 'text-text-muted hover:text-text'
                        }`}
                      >
                        {link.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

