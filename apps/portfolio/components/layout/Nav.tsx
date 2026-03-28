'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpenText,
  BookText,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Copy,
  FileCode2,
  FileText,
  Github,
  Headphones,
  Home,
  LibraryBig,
  Menu,
  Mic2,
  MoveUpRight,
  Radio,
  ScrollText,
  Settings,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-react';
import type { NavIconKey, NavMenuSection } from '@/lib/site-menus';

const EMAIL = 'benjamingarrard5279@gmail.com';
const GITHUB_URL = 'https://github.com/B2Gdevs';

const iconMap: Record<NavIconKey, React.ComponentType<{ size?: number; className?: string }>> = {
  'book-open': BookOpenText,
  'book-text': BookText,
  compass: Compass,
  'file-code': FileCode2,
  'file-text': FileText,
  headphones: Headphones,
  home: Home,
  library: LibraryBig,
  mic: Mic2,
  'move-up-right': MoveUpRight,
  radio: Radio,
  scroll: ScrollText,
  sparkles: Sparkles,
  wand: WandSparkles,
};

function SidebarContent({
  pathname,
  navMenus,
  collapsed = false,
  onNavigate,
}: {
  pathname: string;
  navMenus: NavMenuSection[];
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard not available.
    }
  };

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 750);
  };

  if (collapsed) {
    const collapsedItems = [
      {
        href: '/',
        label: 'Home',
        icon: Home,
        isActive: pathname === '/',
      },
      {
        href: '/resumes',
        label: 'Resumes',
        icon: FileText,
        isActive: pathname === '/resumes' || pathname.startsWith('/resumes/'),
      },
      {
        href: '/projects',
        label: 'Projects',
        icon: Compass,
        isActive: pathname === '/projects' || pathname.startsWith('/projects/'),
      },
      {
        href: '/books',
        label: 'Books',
        icon: LibraryBig,
        isActive: pathname === '/books' || pathname.startsWith('/books/'),
      },
      {
        href: '/listen',
        label: 'Songs',
        icon: Headphones,
        isActive: pathname === '/listen' || pathname.startsWith('/listen/'),
      },
      ...navMenus.flatMap((menu) =>
        menu.items
          .filter((item) => !item.external)
          .map((item) => ({
            href: item.href,
            label: item.label,
            icon: iconMap[item.icon],
            isActive: pathname === item.href || pathname.startsWith(item.href + '/'),
          }))
      ),
    ];

    return (
      <div className="sidebar-shell flex h-full flex-col items-center">
        <div className="sidebar-ornament" />

        <div className="relative z-10 flex w-full justify-center border-b border-border/70 px-3 py-5">
          <Link
            href="/"
            onClick={onNavigate}
            className="rounded-[1.4rem] p-2 transition-colors hover:bg-white/5"
            aria-label="Go to home"
            title="Home"
          >
            <div className="sidebar-logo-wrap">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full bg-zinc-900/60 p-1 logo-hover-green"
              />
            </div>
          </Link>
        </div>

        <div
          className={`sidebar-scroll-area relative z-10 flex-1 overflow-y-auto px-2 py-5 ${
            isScrolling ? 'scroll-active' : ''
          }`}
          onScroll={handleScroll}
        >
          <div className="flex flex-col items-center gap-2">
            {collapsedItems.map((item) => {
              const ItemIcon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-label={item.label}
                  title={item.label}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                    item.isActive
                      ? 'border-[rgba(213,176,131,0.45)] bg-[rgba(213,176,131,0.14)] text-[#fff3e5]'
                      : 'border-border/70 bg-dark/60 text-text-muted hover:border-[rgba(213,176,131,0.4)] hover:text-primary'
                  }`}
                >
                  <ItemIcon size={17} />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex w-full flex-col items-center gap-3 border-t border-border/70 px-3 py-5">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-secondary transition hover:opacity-90"
            aria-label={copied ? 'Copied email' : 'Copy email'}
            title={copied ? 'Copied!' : 'Copy email'}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>

          {process.env.NODE_ENV === 'development' ? (
            <Link
              href="/admin"
              onClick={onNavigate}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-dark/60 text-text-muted transition-colors hover:text-primary"
              aria-label="Admin"
              title="Admin"
            >
              <Settings size={16} />
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-shell flex h-full flex-col">
      <div className="sidebar-ornament" />

      <div className="relative z-10 border-b border-border/70 px-5 py-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-[1.4rem] px-2 py-2 transition-colors hover:bg-white/5"
        >
          <div className="sidebar-logo-wrap">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full bg-zinc-900/60 p-1 logo-hover-green"
            />
          </div>
          <div>
            <span className="block text-xs uppercase tracking-[0.28em] text-text-muted">Ben Garrard</span>
            <span className="font-display text-xl tracking-tight text-primary">Story, sound, systems</span>
          </div>
        </Link>

        <div className="mt-4">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-border/70 bg-dark/70 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
            <Link
              href="/"
              onClick={onNavigate}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                pathname === '/' ? 'bg-primary text-secondary' : 'text-text-muted hover:text-primary'
              }`}
            >
              <Home size={14} />
              <span>Home</span>
            </Link>
            <Link
              href="/resumes"
              onClick={onNavigate}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                pathname === '/resumes' || pathname.startsWith('/resumes/')
                  ? 'bg-primary text-secondary'
                  : 'text-text-muted hover:text-primary'
              }`}
            >
              <FileText size={14} />
              <span>Resumes</span>
            </Link>
            <Link
              href="/projects"
              onClick={onNavigate}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                pathname === '/projects' || pathname.startsWith('/projects/')
                  ? 'bg-primary text-secondary'
                  : 'text-text-muted hover:text-primary'
              }`}
            >
              <Compass size={14} />
              <span>Projects</span>
            </Link>
            <Link
              href="/books"
              onClick={onNavigate}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                pathname === '/books' || pathname.startsWith('/books/')
                  ? 'bg-primary text-secondary'
                  : 'text-text-muted hover:text-primary'
              }`}
            >
              <LibraryBig size={14} />
              <span>Books</span>
            </Link>
            <Link
              href="/listen"
              onClick={onNavigate}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                pathname === '/listen' || pathname.startsWith('/listen/')
                  ? 'bg-primary text-secondary'
                  : 'text-text-muted hover:text-primary'
              }`}
            >
              <Headphones size={14} />
              <span>Songs</span>
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              onClick={onNavigate}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:text-primary"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="mt-4">
          <Link
            href="/"
            onClick={onNavigate}
            className={`sidebar-home-link ${
              pathname === '/' ? 'sidebar-link-active' : 'sidebar-link-idle'
            }`}
          >
            <span className="sidebar-icon-badge">
              <Home size={16} />
            </span>
            <span>
              <span className="block text-sm font-medium text-primary">Home</span>
              <span className="block text-xs text-text-muted">Front page reading and latest work</span>
            </span>
          </Link>
        </div>
      </div>

      <div
        className={`sidebar-scroll-area relative z-10 flex-1 overflow-y-auto px-4 py-5 ${
          isScrolling ? 'scroll-active' : ''
        }`}
        onScroll={handleScroll}
      >
        <div className="space-y-5">
          {navMenus.map((menu) => {
            const SectionIcon = iconMap[menu.icon];

            return (
              <section key={menu.id} className="sidebar-section-card">
                <div className={`sidebar-section-glow bg-gradient-to-br ${menu.accent}`} />
                <div className="relative z-10">
                  <div className="flex items-start gap-3 px-1">
                    <span className="sidebar-icon-badge mt-0.5">
                      <SectionIcon size={16} />
                    </span>
                    <div>
                      <p className="section-kicker">{menu.label}</p>
                      <p className="mt-2 text-sm leading-6 text-text-muted">{menu.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {menu.items.map((item) => {
                      const ItemIcon = iconMap[item.icon];
                      const isActive =
                        !item.external &&
                        (pathname === item.href || pathname.startsWith(item.href + '/'));

                      if (item.external) {
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={onNavigate}
                            className="sidebar-item-link sidebar-link-idle"
                          >
                            <span className="sidebar-icon-badge">
                              <ItemIcon size={16} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-primary">{item.label}</span>
                              <span className="mt-1 block text-xs leading-6 text-text-muted">{item.description}</span>
                            </span>
                            <MoveUpRight size={14} className="mt-1 shrink-0 text-text-muted" />
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onNavigate}
                          className={`sidebar-item-link ${
                            isActive ? 'sidebar-link-active' : 'sidebar-link-idle'
                          }`}
                        >
                          <span className="sidebar-icon-badge">
                            <ItemIcon size={16} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-primary">{item.label}</span>
                            <span className="mt-1 block text-xs leading-6 text-text-muted">{item.description}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 border-t border-border/70 px-5 py-5">
        <button
          type="button"
          onClick={handleCopyEmail}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-secondary transition hover:opacity-90"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy email'}
        </button>

        {process.env.NODE_ENV === 'development' ? (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-text-muted transition-colors hover:text-primary"
          >
            <Settings size={16} />
            Admin
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function Nav({
  navMenus,
  collapsed = false,
  onToggleCollapsed,
}: {
  navMenus: NavMenuSection[];
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname?.startsWith('/dialogue-forge')) {
    return null;
  }

  return (
    <>
      <div className="border-b border-border/80 bg-dark-alt/85 px-4 py-4 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="sidebar-logo-wrap">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full bg-zinc-900/60 p-1 logo-hover-green"
              />
            </div>
            <div>
              <span className="block text-xs uppercase tracking-[0.28em] text-text-muted">Ben Garrard</span>
              <span className="font-display text-lg text-primary">Story, sound, systems</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-dark text-text-muted transition-colors hover:text-primary"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <aside
        className={`hidden overflow-hidden border-r border-border/80 bg-dark-alt/85 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:sticky lg:top-0 lg:block lg:h-screen lg:backdrop-blur-xl ${
          collapsed ? 'lg:w-[88px]' : 'lg:w-[320px]'
        }`}
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={`absolute top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-dark/80 text-text-muted transition-colors hover:text-primary ${
              collapsed ? 'left-1/2 -translate-x-1/2' : 'right-4'
            }`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={collapsed ? 'collapsed-sidebar' : 'expanded-sidebar'}
              initial={{ opacity: 0, x: collapsed ? -18 : 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: collapsed ? 18 : -18 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <SidebarContent pathname={pathname ?? ''} navMenus={navMenus} collapsed={collapsed} />
            </motion.div>
          </AnimatePresence>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-[88vw] max-w-[360px] border-r border-border bg-dark-alt shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-dark text-text-muted transition-colors hover:text-primary"
            >
              <X size={18} />
            </button>
            <SidebarContent
              pathname={pathname ?? ''}
              navMenus={navMenus}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
