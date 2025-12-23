'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, ChevronRight, ChevronDown, Home, Download, 
  FolderTree, Send, ArrowLeftRight, Wrench, Edit, 
  Settings, Palette, PenTool, Globe, Mountain, Hash, 
  Code, Grid3x3, Image as ImageIcon, Cpu, MessageSquare,
  BookOpen, FileCode, Database, Lock, Users, GitBranch,
  FileText, Zap, Layers, Package, Terminal, FileCheck
} from 'lucide-react';
import type { ContentMeta } from '@/lib/content';

interface DocsLayoutProps {
  children: React.ReactNode;
  docs: Array<{ meta: ContentMeta; slug: string }>;
  currentSlug?: string;
}

// Icon mapping for docs
function getIconForDoc(slug: string, title: string): React.ComponentType<{ size?: number; className?: string }> {
  const slugLower = slug.toLowerCase();
  const titleLower = title.toLowerCase();

  // Top-level docs
  if (slugLower === 'getting-started') return Home;
  if (slugLower === 'mdx-parser' || titleLower.includes('mdx')) return FileCode;
  if (slugLower === 'architecture' || titleLower.includes('architecture')) return FolderTree;

  // Book Editor docs
  if (slugLower.includes('book-editor')) {
    if (slugLower.includes('overview') || slugLower.includes('index')) return BookOpen;
    if (slugLower.includes('architecture')) return Layers;
    if (slugLower.includes('auth')) return Lock;
    if (slugLower.includes('auth-options')) return Settings;
    if (slugLower.includes('database')) return Database;
    if (slugLower.includes('collaboration')) return Users;
    if (slugLower.includes('conflict')) return GitBranch;
    if (slugLower.includes('file-upload')) return FileText;
    if (slugLower.includes('highlighting')) return PenTool;
    if (slugLower.includes('tiptap')) return Edit;
    if (slugLower.includes('quick-reference')) return Zap;
    if (slugLower.includes('tech-stack')) return Package;
    if (slugLower.includes('implementation')) return Terminal;
    if (slugLower.includes('task-plan')) return FileCheck;
    return BookOpen;
  }

  // Default icons based on keywords
  if (titleLower.includes('getting started') || titleLower.includes('introduction')) return Home;
  if (titleLower.includes('installation') || titleLower.includes('setup')) return Download;
  if (titleLower.includes('migration')) return ArrowLeftRight;
  if (titleLower.includes('troubleshooting')) return Wrench;
  if (titleLower.includes('configuration') || titleLower.includes('config')) return Settings;
  if (titleLower.includes('theme') || titleLower.includes('styling')) return Palette;
  if (titleLower.includes('customization')) return PenTool;
  if (titleLower.includes('internationalization') || titleLower.includes('i18n')) return Globe;
  if (titleLower.includes('markdown') || titleLower.includes('syntax')) return Hash;
  if (titleLower.includes('code block') || titleLower.includes('code')) return Code;
  if (titleLower.includes('component')) return Grid3x3;
  if (titleLower.includes('image') || titleLower.includes('embed')) return ImageIcon;
  if (titleLower.includes('mcp') || titleLower.includes('server')) return Cpu;
  if (titleLower.includes('llm') || titleLower.includes('ai')) return MessageSquare;

  return FileText;
}

// Organize docs into hierarchical sections
function organizeDocs(docs: Array<{ meta: ContentMeta; slug: string }>) {
  const sections: Record<string, Array<{ meta: ContentMeta; slug: string }>> = {};
  const topLevel: Array<{ meta: ContentMeta; slug: string }> = [];

  docs.forEach((doc) => {
    if (doc.slug.includes('/')) {
      const [section] = doc.slug.split('/');
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(doc);
    } else {
      topLevel.push(doc);
    }
  });

  return { sections, topLevel };
}

// Group top-level docs into sections
function groupTopLevelDocs(docs: Array<{ meta: ContentMeta; slug: string }>) {
  const groups: Record<string, Array<{ meta: ContentMeta; slug: string }>> = {
    'Getting Started': [],
    'Core Concepts': [],
    'Essentials': [],
  };

  docs.forEach((doc) => {
    const slug = doc.slug.toLowerCase();
    const title = doc.meta.title.toLowerCase();

    if (slug === 'getting-started' || title.includes('getting started') || title.includes('introduction')) {
      groups['Getting Started'].push(doc);
    } else if (
      slug.includes('architecture') || 
      title.includes('architecture') ||
      slug.includes('mdx-parser')
    ) {
      groups['Core Concepts'].push(doc);
    } else {
      groups['Essentials'].push(doc);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

export default function DocsLayout({ children, docs, currentSlug }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Getting Started', 'Core Concepts', 'Essentials', 'Book Editor']));
  const pathname = usePathname();

  const { sections, topLevel } = useMemo(() => organizeDocs(docs), [docs]);
  const topLevelGroups = useMemo(() => groupTopLevelDocs(topLevel), [topLevel]);

  // Section display names
  const sectionNames: Record<string, string> = {
    'getting-started': 'Getting Started',
    'book-editor': 'Book Editor',
    'architecture': 'Architecture',
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Navigation content component (reusable for mobile and desktop)
  const NavigationContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <Link
        href="/docs"
        className="text-xl font-bold text-white mb-8 block hover:text-green-400 transition-colors"
        onClick={onItemClick}
      >
        Documentation
      </Link>
      
      <nav className="space-y-6">
        {/* Overview */}
        <div>
          <NavItem
            href="/docs"
            title="Overview"
            icon={Home}
            isActive={pathname === '/docs'}
            onClick={onItemClick}
          />
        </div>

        {/* Top-level docs grouped by section */}
        {Object.entries(topLevelGroups).map(([sectionName, sectionDocs]) => {
          const isExpanded = expandedSections.has(sectionName);
          
          return (
            <div key={sectionName}>
              <button
                onClick={() => toggleSection(sectionName)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              >
                <span>{sectionName}</span>
                {isExpanded ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500" />
                )}
              </button>
              
              {isExpanded && (
                <div className="mt-1 space-y-0.5">
                  {sectionDocs.map((doc) => {
                    const docPath = `/docs/${doc.slug}`;
                    const isActive = pathname === docPath;
                    const Icon = getIconForDoc(doc.slug, doc.meta.title);
                    
                    return (
                      <NavItem
                        key={doc.slug}
                        href={docPath}
                        title={doc.meta.title}
                        icon={Icon}
                        isActive={isActive}
                        onClick={onItemClick}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Sectioned docs (folders) */}
        {Object.entries(sections).map(([sectionKey, sectionDocs]) => {
          const sectionName = sectionNames[sectionKey] || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
          const isExpanded = expandedSections.has(sectionName);
          
          return (
            <div key={sectionKey}>
              <button
                onClick={() => toggleSection(sectionName)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              >
                <span>{sectionName}</span>
                {isExpanded ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500" />
                )}
              </button>
              
              {isExpanded && (
                <div className="mt-1 space-y-0.5">
                  {sectionDocs.map((doc) => {
                    const docPath = `/docs/${doc.slug}`;
                    const isActive = pathname === docPath;
                    const Icon = getIconForDoc(doc.slug, doc.meta.title);
                    
                    return (
                      <NavItem
                        key={doc.slug}
                        href={docPath}
                        title={doc.meta.title}
                        icon={Icon}
                        isActive={isActive}
                        onClick={onItemClick}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );

  // Nav item component with vertical line indicator
  const NavItem = ({ 
    href, 
    title, 
    icon: Icon, 
    isActive, 
    onClick 
  }: { 
    href: string; 
    title: string; 
    icon: React.ComponentType<{ size?: number; className?: string }>; 
    isActive: boolean; 
    onClick?: () => void;
  }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`
        relative flex items-center gap-3 px-3 py-2 text-sm transition-colors group
        ${isActive
          ? 'text-white'
          : 'text-gray-400 hover:text-gray-300'
        }
      `}
    >
      {/* Vertical line indicator - always visible, brighter when active */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-0.5 transition-all duration-200
          ${isActive 
            ? 'bg-green-400' 
            : 'bg-gray-600/40'
          }
        `}
      />
      
      {/* Icon */}
      <Icon 
        size={18} 
        className={`
          flex-shrink-0 transition-colors
          ${isActive ? 'text-green-400' : 'text-gray-400 group-hover:text-gray-300'}
        `} 
      />
      
      {/* Title */}
      <span className={isActive ? 'font-medium' : ''}>{title}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-dark">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-dark-elevated border border-border shadow-lg text-gray-300"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed lg:hidden top-0 left-0 h-screen w-64 bg-dark-alt border-r border-border
          overflow-y-auto z-40 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6">
          <NavigationContent onItemClick={() => setSidebarOpen(false)} />
        </div>
      </aside>

      {/* Main Content with Sidebar */}
      <main>
        <div className="flex gap-8 max-w-7xl mx-auto px-4 lg:px-8">
          {/* Desktop Sidebar - Part of centered content flow */}
          <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-border">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="p-6">
                <NavigationContent />
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}



