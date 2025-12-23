# Developer Documentation System - Complete Technical Reference

This document explains how the documentation system works in this portfolio. It uses MDX (Markdown + JSX) with Next.js, custom components, and a GitBook-style layout. This guide is intended for another AI or developer to recreate this exact system.

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Content Management](#content-management)
5. [MDX Processing Pipeline](#mdx-processing-pipeline)
6. [Custom MDX Components](#custom-mdx-components)
7. [Layout System](#layout-system)
8. [Styling & Theme](#styling--theme)
9. [Code Examples](#code-examples)
10. [Creating New Documentation](#creating-new-documentation)

---

## Overview

The documentation system provides:

- **File-based content**: MDX files in `/content/docs/` are automatically discovered and rendered
- **Nested folder support**: Supports hierarchical documentation (e.g., `book-editor/overview.mdx`)
- **GitBook-style UI**: Left sidebar navigation, right table of contents, expandable sections
- **Syntax highlighting**: Code blocks with language detection, icons, and copy buttons
- **Custom components**: YouTube embeds, enhanced images, styled code blocks
- **Auto-generated navigation**: Sidebar and TOC built from file structure and headings
- **Date tracking**: Automatic file modification dates, manual date/updated fields in frontmatter

---

## Technology Stack

### Core Dependencies

```json
{
  "dependencies": {
    "next": "16.0.8",
    "react": "19.2.1",
    "next-mdx-remote": "^5.0.0",
    "@mdx-js/loader": "^3.1.1",
    "@mdx-js/react": "^3.1.1",
    "@next/mdx": "^16.0.8",
    "gray-matter": "^4.0.3",
    "remark-gfm": "^4.0.1",
    "rehype-slug": "^6.0.0",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-pretty-code": "^0.14.1",
    "framer-motion": "^12.23.26",
    "lucide-react": "^0.559.0",
    "date-fns": "^4.1.0"
  }
}
```

### Plugin Chain

```
MDX File
  ↓
gray-matter (parse frontmatter)
  ↓
next-mdx-remote/rsc (React Server Component rendering)
  ↓
Remark Plugins:
  - remark-gfm (GitHub Flavored Markdown: tables, strikethrough, etc.)
  ↓
Rehype Plugins:
  - rehype-slug (add IDs to headings)
  - rehype-autolink-headings (make headings clickable)
  - rehype-pretty-code (syntax highlighting with Shiki)
  ↓
Custom MDX Components (React rendering)
```

---

## Directory Structure

```
project-root/
├── app/
│   └── docs/
│       ├── page.tsx                    # /docs - Documentation index page
│       ├── [slug]/
│       │   └── page.tsx                # /docs/[slug] - Single slug docs
│       └── [...slug]/
│           └── page.tsx                # /docs/[...slug] - Nested docs (catch-all)
├── components/
│   └── docs/
│       ├── DocsLayout.tsx              # Main layout with sidebar
│       ├── DocsGrid.tsx                # Grid of doc cards
│       ├── DocsHeader.tsx              # Page header component
│       ├── RecentDocs.tsx              # Recently updated docs section
│       ├── TableOfContents.tsx         # Right sidebar TOC
│       ├── CodeBlock.tsx               # Custom code block with copy button
│       └── QuickReference.tsx          # Quick reference component
├── content/
│   └── docs/
│       ├── getting-started.mdx         # Top-level docs
│       ├── architecture.mdx
│       ├── mdx-parser.mdx
│       └── book-editor/                # Nested folder = section
│           ├── index.mdx
│           ├── overview.mdx
│           ├── architecture.mdx
│           └── ... (more docs)
├── lib/
│   ├── content.ts                      # File-based content utilities
│   ├── mdx.tsx                         # Custom MDX components
│   └── mdx-options.ts                  # MDX plugin configuration
└── next.config.ts                      # Next.js + MDX configuration
```

---

## Content Management

### File: `lib/content.ts`

This module handles discovering, reading, and parsing MDX files from the filesystem.

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

export interface ContentMeta {
  title: string;
  slug: string;
  description?: string;
  date?: string;
  updated?: string;
  tags?: string[];
  [key: string]: any;
}

// Recursively get all MDX files from a content type directory
export function getContentFiles(type: 'docs' | 'projects' | 'blog'): string[] {
  const typeDir = path.join(contentDirectory, type);
  if (!fs.existsSync(typeDir)) {
    return [];
  }
  
  const files: string[] = [];
  function walkDir(dir: string, baseDir: string = typeDir): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath, baseDir);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        const relativePath = path.relative(baseDir, fullPath);
        files.push(relativePath);
      }
    }
  }
  
  walkDir(typeDir);
  return files;
}

// Get a single content item by slug
export function getContentBySlug(
  type: 'docs' | 'projects' | 'blog',
  slug: string
): { meta: ContentMeta; content: string } | null {
  const typeDir = path.join(contentDirectory, type);
  const files = getContentFiles(type);
  
  // Find file matching slug (handle nested paths like "book-editor/overview")
  const file = files.find((f) => {
    const fileSlug = f.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
    return fileSlug === slug;
  });

  if (!file) return null;

  const filePath = path.join(typeDir, file);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  // Get file stats for automatic dates
  const stats = fs.statSync(filePath);
  const fileModifiedDate = stats.mtime.toISOString().split('T')[0];

  return {
    meta: {
      ...data,
      slug: slug,
      date: data.date || fileModifiedDate,
      updated: data.updated || fileModifiedDate,
    } as ContentMeta,
    content,
  };
}

// Get all content items of a type, sorted by date
export function getAllContent(type: 'docs' | 'projects' | 'blog'): Array<{
  meta: ContentMeta;
  slug: string;
}> {
  const files = getContentFiles(type);
  
  return files
    .map((file) => {
      const slug = file.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
      const content = getContentBySlug(type, slug);
      if (!content) return null;
      return { meta: content.meta, slug };
    })
    .filter((item): item is { meta: ContentMeta; slug: string } => item !== null)
    .sort((a, b) => {
      const dateA = a.meta.updated 
        ? new Date(a.meta.updated).getTime() 
        : (a.meta.date ? new Date(a.meta.date).getTime() : 0);
      const dateB = b.meta.updated 
        ? new Date(b.meta.updated).getTime() 
        : (b.meta.date ? new Date(b.meta.date).getTime() : 0);
      return dateB - dateA;
    });
}
```

### Frontmatter Schema

Each MDX file should have YAML frontmatter:

```yaml
---
title: "Document Title"
description: "Brief description of the document"
date: "2025-01-15"      # Optional: creation date
updated: "2025-01-20"   # Optional: last update date
tags: ["tag1", "tag2"]  # Optional: for filtering
---
```

If `date` or `updated` are omitted, the file's modification timestamp is used.

---

## MDX Processing Pipeline

### File: `lib/mdx-options.ts`

Configures the remark/rehype plugin chain:

```typescript
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

export const mdxOptions: any = {
  parseFrontmatter: false,  // gray-matter handles this
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,  // Adds id attributes to headings
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',  // Wrap heading text in anchor
          properties: {
            className: ['anchor'],
          },
        },
      ],
      [
        rehypePrettyCode,
        {
          theme: 'github-dark',
          keepBackground: false,
          onVisitLine(node: any) {
            // Prevent empty lines from collapsing
            if (node.children.length === 0) {
              node.children = [{ type: 'text', value: ' ' }];
            }
          },
          onVisitHighlightedLine(node: any) {
            node.properties.className.push('highlighted');
          },
          onVisitHighlightedWord(node: any) {
            node.properties.className = ['word'];
          },
        },
      ],
    ],
  },
};
```

### File: `next.config.ts`

Next.js configuration with MDX support:

```typescript
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  experimental: {
    mdxRs: false,  // Use JS-based MDX compiler
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor'] } }],
      [rehypePrettyCode, { theme: 'github-dark', keepBackground: false }],
    ],
  },
});

export default withMDX(nextConfig);
```

---

## Custom MDX Components

### File: `lib/mdx.tsx`

Maps HTML elements to custom React components:

```typescript
import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import { CodeBlock } from '@/components/docs/CodeBlock';
import YouTubeEmbed from '@/components/projects/YouTubeEmbed';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Enhanced images with caption support
    img: (props) => {
      if (props.src) {
        return (
          <div className="my-8 rounded-lg overflow-hidden border border-border shadow-lg">
            <Image
              src={props.src as string}
              alt={props.alt || ''}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
            />
            {props.alt && (
              <p className="text-sm text-text-muted text-center py-2 bg-dark-alt border-t border-border">
                {props.alt}
              </p>
            )}
          </div>
        );
      }
      return <img {...props} />;
    },

    // Headings with auto-generated IDs and scroll margin for anchor links
    h1: (props) => (
      <h1 
        id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="scroll-mt-24" 
        {...props} 
      />
    ),
    h2: (props) => (
      <h2 
        id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="scroll-mt-24" 
        {...props} 
      />
    ),
    h3: (props) => (
      <h3 
        id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="scroll-mt-24" 
        {...props} 
      />
    ),
    h4: (props) => (
      <h4 
        id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')}
        className="scroll-mt-24" 
        {...props} 
      />
    ),

    // Links
    a: (props) => (
      <a
        className="font-medium hover:underline underline-offset-2 transition-colors"
        {...props}
      />
    ),

    // Inline code (red text, dark background)
    code: (props: any) => {
      if (typeof props.children === 'string' && !props.children.includes('\n')) {
        return (
          <code
            className="bg-dark-alt px-1.5 py-0.5 rounded text-sm font-mono border border-border"
            style={{ color: '#f87171' }}
            {...props}
          />
        );
      }
      return <code {...props} />;
    },

    // Code blocks with custom CodeBlock component
    pre: (props: any) => {
      const codeElement = props.children;
      
      if (!codeElement || typeof codeElement !== 'object') {
        return (
          <pre
            className="bg-dark-alt border border-border rounded-lg p-4 overflow-x-auto mb-6 text-sm"
            {...props}
          />
        );
      }

      const codeProps = codeElement.props || {};
      const className = codeProps.className || '';
      const dataLanguage = props['data-language'] || codeProps['data-language'] || '';
      const langMatch = className.match(/language-(\w+)/);
      const language = langMatch ? langMatch[1] : dataLanguage;
      
      return (
        <CodeBlock
          className={className}
          data-language={language}
          preProps={props}
        >
          {codeElement}
        </CodeBlock>
      );
    },

    // Lists
    ul: (props) => (
      <ul className="list-disc list-outside mb-6 space-y-2 ml-6 text-text" {...props} />
    ),
    ol: (props) => (
      <ol className="list-decimal list-outside mb-6 space-y-2 ml-6 text-text" {...props} />
    ),
    li: (props) => (
      <li className="text-base leading-7 pl-2" {...props} />
    ),

    // Blockquotes
    blockquote: (props) => (
      <blockquote
        className="border-l-4 border-accent/30 pl-6 py-2 my-6 italic text-text-muted bg-dark-alt/50 rounded-r"
        {...props}
      />
    ),

    // Horizontal rules
    hr: (props) => (
      <hr className="my-8 border-border" {...props} />
    ),

    // Tables
    table: (props) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-border rounded-lg" {...props} />
      </div>
    ),
    th: (props) => (
      <th className="border border-border bg-dark-alt px-4 py-3 text-left font-semibold text-primary" {...props} />
    ),
    td: (props) => (
      <td className="border border-border px-4 py-3 text-text" {...props} />
    ),

    // Custom Components available in MDX
    YouTube: (props: { url: string; title?: string }) => (
      <YouTubeEmbed url={props.url} title={props.title} />
    ),

    ...components,
  };
}
```

### File: `components/docs/CodeBlock.tsx`

Custom code block with header bar, language icon, and copy button:

```typescript
'use client';

import React, { useState, useRef } from 'react';
import { Copy, Check, Terminal, Code, FileCode } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  'data-language'?: string;
  'data-label'?: string;
  preProps?: any;
}

const languageIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  bash: Terminal,
  sh: Terminal,
  shell: Terminal,
  terminal: Terminal,
  typescript: Code,
  javascript: Code,
  ts: Code,
  js: Code,
  tsx: Code,
  jsx: Code,
  json: FileCode,
  yaml: FileCode,
  yml: FileCode,
};

const getIconForLabel = (label: string, language: string) => {
  if (label.toLowerCase().includes('terminal')) return Terminal;
  return languageIcons[language.toLowerCase()] || Code;
};

export function CodeBlock({ children, className = '', preProps, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);
  
  const language = props['data-language'] || 
    className.split(' ').find(cls => cls.startsWith('language-'))?.replace('language-', '') || '';

  let label = props['data-label'];
  if (!label) {
    label = language ? language.charAt(0).toUpperCase() + language.slice(1) : 'Code';
  }
  
  const Icon = getIconForLabel(label, language);

  const copyToClipboard = async () => {
    if (!codeRef.current) return;
    const codeElement = codeRef.current.querySelector('code');
    const code = codeElement?.textContent || codeRef.current.textContent || '';
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative group my-6 overflow-hidden rounded-lg border border-border bg-dark-alt">
      {/* Header bar */}
      <div className="flex items-center gap-2 border-b border-border bg-dark-alt px-4 py-2.5">
        <Icon size={14} className="shrink-0 text-green-300" />
        <span className="text-green-200 text-xs font-medium">{label}</span>
        
        {/* Copy button */}
        <button
          type="button"
          onClick={copyToClipboard}
          aria-label="Copy code to clipboard"
          className="ml-auto rounded-md inline-flex items-center text-xs gap-1.5 text-green-300 hover:text-green-200 hover:bg-dark-elevated p-1.5 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
        >
          {copied ? <Check size={14} className="text-accent-4" /> : <Copy size={14} />}
        </button>
      </div>
      
      {/* Code content */}
      <pre
        ref={codeRef}
        {...preProps}
        className={`${preProps?.className || ''} m-0 border-0 rounded-none bg-transparent !px-6 py-4 overflow-x-auto`}
        style={{ marginTop: 0, marginBottom: 0, ...preProps?.style }}
      >
        {children}
      </pre>
    </div>
  );
}
```

---

## Layout System

### File: `components/docs/DocsLayout.tsx`

The main layout component providing GitBook-style navigation:

**Key Features:**
- Left sidebar with collapsible sections
- Mobile hamburger menu
- Icon mapping based on doc slug/title
- Vertical line indicators for active items
- Automatic section organization from folder structure

**Navigation Structure:**
```
Documentation (link to /docs)
├── Getting Started (expandable section)
│   └── Getting Started
├── Core Concepts (expandable section)
│   ├── Architecture
│   └── MDX Parser
├── Book Editor (folder-based section)
│   ├── Overview
│   ├── Architecture
│   ├── Database Schema
│   └── ...
```

**Icon Mapping Logic:**
```typescript
function getIconForDoc(slug: string, title: string): IconComponent {
  // Based on slug patterns
  if (slugLower === 'getting-started') return Home;
  if (slugLower.includes('architecture')) return Layers;
  if (slugLower.includes('auth')) return Lock;
  if (slugLower.includes('database')) return Database;
  // ... more mappings
  
  // Based on title keywords
  if (titleLower.includes('configuration')) return Settings;
  if (titleLower.includes('code')) return Code;
  // ... more mappings
  
  return FileText; // Default
}
```

### File: `components/docs/TableOfContents.tsx`

Right sidebar showing headings on the current page:

```typescript
'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from article
    const headingElements = Array.from(
      document.querySelectorAll('article h2, article h3, article h4')
    ).map((el) => ({
      id: el.id || el.textContent?.toLowerCase().replace(/\s+/g, '-') || '',
      text: el.textContent || '',
      level: parseInt(el.tagName.charAt(1)),
    }));

    // Ensure all headings have IDs
    headingElements.forEach((heading, index) => {
      const element = document.querySelectorAll('article h2, article h3, article h4')[index];
      if (element && !element.id) {
        element.id = heading.id;
      }
    });

    setHeadings(headingElements);

    // Intersection Observer for highlighting active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0%' }
    );

    headingElements.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-white uppercase tracking-wide mb-4">
        ON THIS PAGE
      </h3>
      <nav className="space-y-0.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const indentClass = heading.level === 3 ? 'pl-3' : heading.level === 4 ? 'pl-6' : '';
          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`
                relative flex items-center text-sm transition-colors group py-1
                ${indentClass}
                ${isActive ? 'text-green-400' : 'text-gray-400 hover:text-gray-300'}
              `}
            >
              {/* Vertical line indicator */}
              <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-200 ${isActive ? 'bg-green-400' : 'bg-gray-600/40'}`} />
              <span className="pl-3">{heading.text}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
```

---

## Styling & Theme

### Color Scheme (Dark Theme)

```css
/* CSS Variables (in globals.css) */
:root {
  --color-dark: #0a0a0a;
  --color-dark-alt: #111111;
  --color-dark-elevated: #1a1a1a;
  --color-border: #2a2a2a;
  --color-border-hover: #3a3a3a;
  --color-primary: #ffffff;
  --color-text: #e5e5e5;
  --color-text-muted: #a3a3a3;
  --color-accent: #22c55e;      /* Green accent */
  --color-accent-2: #3b82f6;    /* Blue */
  --color-accent-3: #a855f7;    /* Purple */
  --color-accent-4: #eab308;    /* Yellow */
}
```

### Key Tailwind Classes

```css
/* Sidebar */
.sidebar: bg-dark-alt border-r border-border

/* Navigation items */
.nav-item: text-gray-400 hover:text-gray-300
.nav-item-active: text-white

/* Vertical line indicator */
.indicator: w-0.5 bg-gray-600/40
.indicator-active: bg-green-400

/* Code blocks */
.code-block: bg-dark-alt border border-border rounded-lg
.code-header: border-b border-border px-4 py-2.5
.inline-code: bg-dark-alt px-1.5 py-0.5 rounded text-red-400

/* Content */
.prose: prose-invert max-w-none
```

---

## Code Examples

### Page Route: `app/docs/[...slug]/page.tsx`

Handles nested documentation routes:

```typescript
import { notFound } from 'next/navigation';
import { getContentBySlug, getAllContent } from '@/lib/content';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '@/lib/mdx';
import { mdxOptions } from '@/lib/mdx-options';
import DocsLayout from '@/components/docs/DocsLayout';
import TableOfContents from '@/components/docs/TableOfContents';

export async function generateStaticParams() {
  const docs = getAllContent('docs');
  return docs.map((doc) => ({
    slug: doc.slug.split('/'), // "book-editor/overview" → ["book-editor", "overview"]
  }));
}

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const slugString = Array.isArray(slug) ? slug.join('/') : slug;
  const doc = getContentBySlug('docs', slugString);
  const allDocs = getAllContent('docs');

  if (!doc) {
    notFound();
  }

  const components = useMDXComponents({});

  return (
    <DocsLayout docs={allDocs} currentSlug={slugString}>
      <div className="flex gap-12 py-12">
        {/* Main Content */}
        <article className="flex-1 min-w-0">
          <header className="mb-8 pb-6 border-b border-border">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
              {doc.meta.title}
            </h1>
            {doc.meta.description && (
              <p className="text-lg text-text-muted mt-4">
                {doc.meta.description}
              </p>
            )}
          </header>
          
          <div className="prose prose-invert max-w-none">
            <MDXRemote source={doc.content} components={components} options={mdxOptions} />
          </div>
        </article>
        
        {/* Right Sidebar - TOC */}
        <div className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-24 pt-12">
            <TableOfContents />
          </div>
        </div>
      </div>
    </DocsLayout>
  );
}
```

---

## Creating New Documentation

### Step 1: Create MDX File

Create a new file in `content/docs/`:

```
content/docs/my-new-doc.mdx           # → /docs/my-new-doc
content/docs/section/my-doc.mdx       # → /docs/section/my-doc
```

### Step 2: Add Frontmatter

```yaml
---
title: "My New Documentation"
description: "A brief description of what this document covers"
date: "2025-01-20"
---
```

### Step 3: Write Content

```markdown
# My New Documentation

Introduction paragraph.

## Section One

Content with **bold** and `inline code`.

### Subsection

More content.

```typescript
// Code blocks are automatically highlighted
function example() {
  return "Hello World";
}
```

## Section Two

- Bullet points
- Another item

> Blockquotes are styled nicely

| Table | Headers |
|-------|---------|
| Cell  | Cell    |
```

### Step 4: Use Custom Components

```markdown
## Video Tutorial

<YouTube url="https://www.youtube.com/watch?v=VIDEO_ID" title="Tutorial" />
```

### Step 5: Verify

The documentation automatically appears in:
- Left sidebar navigation
- Docs grid on `/docs`
- Recent docs section (if recently updated)

---

## Summary

This documentation system provides:

1. **File-based authoring**: Write MDX files, they become pages
2. **Automatic navigation**: Sidebar built from file structure
3. **Rich formatting**: Syntax highlighting, tables, images with captions
4. **GitBook UX**: Collapsible sections, TOC, icon indicators
5. **Custom components**: YouTube embeds, enhanced code blocks
6. **Date tracking**: Automatic and manual date support
7. **Static generation**: All pages pre-rendered at build time

To recreate this system:
1. Install the dependencies listed above
2. Create the directory structure
3. Implement the content utilities (`lib/content.ts`)
4. Configure MDX plugins (`lib/mdx-options.ts`, `next.config.ts`)
5. Create MDX components (`lib/mdx.tsx`)
6. Build the layout components (DocsLayout, TableOfContents, CodeBlock)
7. Create the page routes with catch-all segments
8. Add your documentation as MDX files




