'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileCode,
  FileText,
  FolderKanban,
  GitBranch,
  Home,
  Menu,
  MessageSquare,
  ScrollText,
  X,
} from 'lucide-react';
import type { ContentMeta } from '@/lib/content';
import { buildDocSections, isPlanningDocSlug, splitSectionDocs } from '@/lib/docs';

interface DocsLayoutProps {
  children: React.ReactNode;
  docs: Array<{ meta: ContentMeta; slug: string }>;
}

// Icon mapping for docs
function getIconForDoc(slug: string, title: string): React.ComponentType<{ size?: number; className?: string }> {
  const slugLower = slug.toLowerCase();
  const titleLower = title.toLowerCase();
  const sectionKey = slugLower.split('/')[0];

  if (slugLower.endsWith('/index') || slugLower.endsWith('/overview')) {
    return Home;
  }

  if (slugLower.endsWith('/planning-docs') || titleLower.includes('planning')) {
    return FolderKanban;
  }

  if (slugLower.includes('architecture') || titleLower.includes('architecture')) {
    return FileCode;
  }

  if (slugLower.includes('dialogue-nodes') || titleLower.includes('node')) {
    return GitBranch;
  }

  if (slugLower.includes('yarn') || titleLower.includes('yarn')) {
    return ScrollText;
  }

  if (slugLower.includes('reader') || titleLower.includes('reader')) {
    return BookOpen;
  }

  if (sectionKey === 'books') return BookOpen;
  if (sectionKey === 'dialogue-forge') return MessageSquare;

  return FileText;
}

function getSectionIcon(sectionKey: string): React.ComponentType<{ size?: number; className?: string }> {
  if (sectionKey === 'books') return BookOpen;
  if (sectionKey === 'dialogue-forge') return MessageSquare;
  return FileText;
}

export default function DocsLayout({ children, docs }: DocsLayoutProps) {
  const pathname = usePathname();
  const docSections = useMemo(() => buildDocSections(docs), [docs]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(buildDocSections(docs).map((section) => section.key))
  );
  const [expandedPlanningFolders, setExpandedPlanningFolders] = useState<Set<string>>(() => {
    const activeSectionKey = pathname?.startsWith('/docs/')
      ? pathname.replace('/docs/', '').split('/')[0]
      : null;
    const activeDocSlug = pathname?.startsWith('/docs/') ? pathname.replace('/docs/', '') : '';
    return activeSectionKey && isPlanningDocSlug(activeDocSlug) ? new Set([activeSectionKey]) : new Set();
  });
  const [sidebarScrolling, setSidebarScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

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

  const togglePlanningFolder = (section: string) => {
    setExpandedPlanningFolders((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleSidebarScroll = () => {
    setSidebarScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => setSidebarScrolling(false), 750);
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

        {docSections.map((section) => {
          const isExpanded = expandedSections.has(section.key);
          const SectionIcon = getSectionIcon(section.key);
          const { planningDocs, referenceDocs } = splitSectionDocs(section.docs);
          const planningExpanded =
            expandedPlanningFolders.has(section.key) ||
            planningDocs.some((doc) => pathname === `/docs/${doc.slug}`);
          
          return (
            <div key={section.key}>
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <SectionIcon size={15} className="text-accent" />
                  <span>{section.label}</span>
                </span>
                <span className="ml-3 flex items-center gap-2 text-xs text-gray-500">
                  <span>{section.docs.length}</span>
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-500" />
                  )}
                </span>
              </button>
              
              {isExpanded && (
                <div className="mt-1 space-y-0.5">
                  {planningDocs.length > 0 && (
                    <div className="mb-2">
                      <button
                        onClick={() => togglePlanningFolder(section.key)}
                        className="relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-400 transition-colors hover:text-gray-200"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-600/30" />
                        <FolderKanban
                          size={18}
                          className={planningExpanded ? 'text-accent' : 'text-gray-400'}
                        />
                        <span className="flex-1 text-left font-medium">Planning Docs</span>
                        {planningExpanded ? (
                          <ChevronDown size={15} className="text-gray-500" />
                        ) : (
                          <ChevronRight size={15} className="text-gray-500" />
                        )}
                      </button>

                      {planningExpanded && (
                        <div className="mt-1 ml-5 space-y-0.5 border-l border-border/60 pl-3">
                          {planningDocs.map((doc) => {
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
                  )}

                  {referenceDocs.map((doc) => {
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
          sidebar-scroll-area overflow-y-auto z-40 transition-transform duration-300
          ${sidebarScrolling ? 'scroll-active' : ''}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        onScroll={handleSidebarScroll}
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
            <div
              className={`sidebar-scroll-area sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto ${
                sidebarScrolling ? 'scroll-active' : ''
              }`}
              onScroll={handleSidebarScroll}
            >
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



