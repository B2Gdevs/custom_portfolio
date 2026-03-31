'use client';

import { useEffect, useRef, useState, type MouseEventHandler } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpenText,
  BookText,
  ChevronLeft,
  Compass,
  MoreHorizontal,
  FileCode2,
  FileText,
  Github,
  Headphones,
  Home,
  LayoutGrid,
  LibraryBig,
  Mail,
  Mic2,
  MoveUpRight,
  Radio,
  ScrollText,
  Settings,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import type { NavIconKey, NavMenuSection } from '@/lib/site-menus';
import { PlanningPackSidebarButton } from '@/components/planning/PlanningPackSidebarButton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const GITHUB_URL = 'https://github.com/B2Gdevs';
/** Public contact link only — no email shown in the UI. Override with NEXT_PUBLIC_CONTACT_HREF. */
const CONTACT_HREF =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CONTACT_HREF?.trim()
    ? process.env.NEXT_PUBLIC_CONTACT_HREF.trim()
    : GITHUB_URL;

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

const primaryNavItems: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  match: (p: string) => boolean;
}[] = [
  { href: '/', label: 'Home', icon: Home, match: (p) => p === '/' },
  {
    href: '/resumes',
    label: 'Resumes',
    icon: FileText,
    match: (p) => p === '/resumes' || p.startsWith('/resumes/'),
  },
  {
    href: '/docs',
    label: 'Docs',
    icon: ScrollText,
    match: (p) => p === '/docs' || p.startsWith('/docs/'),
  },
  {
    href: '/projects',
    label: 'Projects',
    icon: Compass,
    match: (p) => p === '/projects' || p.startsWith('/projects/'),
  },
  {
    href: '/apps',
    label: 'Apps',
    icon: LayoutGrid,
    match: (p) =>
      p !== '/apps/reader' &&
      !p.startsWith('/apps/reader/') &&
      (p === '/apps' || p.startsWith('/apps/')),
  },
  {
    href: '/apps/reader',
    label: 'Books',
    icon: LibraryBig,
    match: (p) => p === '/apps/reader' || p.startsWith('/apps/reader/'),
  },
  {
    href: '/listen',
    label: 'Songs',
    icon: Headphones,
    match: (p) => p === '/listen' || p.startsWith('/listen/'),
  },
];

function CollapsedPrimaryLinks({ pathname, onLinkClick }: { pathname: string; onLinkClick?: () => void }) {
  return (
    <SidebarMenu className="hidden gap-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center">
      {primaryNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.match(pathname);
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.label}
              className="border border-transparent data-active:border-sidebar-ring/50"
              render={<Link href={item.href} onClick={onLinkClick} />}
            >
              <Icon size={17} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function SidebarToggleButton() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';

  /** Icon rail has no expand control — hover on the rail expands; only show collapse when expanded. */
  if (collapsed) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={toggleSidebar}
      className="absolute right-2 top-3 z-20 border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground hover:bg-sidebar-accent"
      aria-label="Collapse sidebar"
      title="Collapse sidebar"
    >
      <ChevronLeft size={18} />
    </Button>
  );
}

function sectionHasActiveItem(menu: NavMenuSection, pathname: string): boolean {
  return menu.items.some((item) => {
    if (item.external) return false;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
}

/** Expanded rail: section rows open a dropdown of links; icon rail flattens links with tooltips. */
function NavMenuSections({
  pathname,
  navMenus,
  onLinkClick,
}: {
  pathname: string;
  navMenus: NavMenuSection[];
  onLinkClick?: () => void;
}) {
  const { state, isMobile } = useSidebar();
  const railCollapsed = state === 'collapsed';

  if (railCollapsed) {
    return (
      <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
        {navMenus.flatMap((menu) =>
          menu.items.map((item) => {
            const ItemIcon = iconMap[item.icon];
            const isActive =
              !item.external &&
              (pathname === item.href || pathname.startsWith(`${item.href}/`));
            const key = `${menu.id}-${item.label}-${item.href}`;
            const tip = `${menu.label}: ${item.label}`;

            if (item.external) {
              return (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    tooltip={tip}
                    className="border border-transparent"
                    render={
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={onLinkClick}
                      />
                    }
                  >
                    <ItemIcon size={17} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return (
              <SidebarMenuItem key={key}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={tip}
                  className="border border-transparent data-active:border-sidebar-ring/50"
                  render={<Link href={item.href} onClick={onLinkClick} />}
                >
                  <ItemIcon size={17} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })
        )}
      </SidebarMenu>
    );
  }

  return (
    <SidebarGroup className="p-0">
      <SidebarMenu className="gap-1 px-1">
        {navMenus.map((menu) => {
          const SectionIcon = iconMap[menu.icon];
          const sectionActive = sectionHasActiveItem(menu, pathname);

          return (
            <DropdownMenu key={menu.id}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={sectionActive}
                  className="h-auto min-h-10 flex-wrap py-2 data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
                  render={<DropdownMenuTrigger />}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-sidebar-border/60 bg-sidebar-accent/25">
                    <SectionIcon size={16} className="text-accent" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="section-kicker block text-sidebar-foreground">{menu.label}</span>
                    <span
                      className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-sidebar-foreground/55"
                      title={menu.description}
                    >
                      {menu.description}
                    </span>
                  </span>
                  <MoreHorizontal className="ml-auto size-4 shrink-0 text-sidebar-foreground/50" aria-hidden />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <DropdownMenuContent
                side={isMobile ? 'bottom' : 'right'}
                align={isMobile ? 'end' : 'start'}
                sideOffset={isMobile ? 6 : 8}
                className="min-w-56 rounded-lg border-border bg-popover text-popover-foreground"
              >
                {menu.items.map((item) => {
                  const ItemIcon = iconMap[item.icon];
                  const isActive =
                    !item.external &&
                    (pathname === item.href || pathname.startsWith(`${item.href}/`));
                  const key = `${menu.id}-${item.label}-${item.href}`;

                  const itemClass = cn(
                    isActive && 'bg-accent/15 font-medium text-accent-foreground'
                  );

                  if (item.external) {
                    return (
                      <DropdownMenuItem
                        key={key}
                        className={itemClass}
                        render={(props) => (
                          <a
                            {...props}
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            title={item.description}
                            onClick={(e) => {
                              onLinkClick?.();
                              props.onClick?.(e);
                            }}
                            className={cn(
                              'flex w-full cursor-pointer items-center gap-2',
                              itemClass,
                              props.className
                            )}
                          >
                            <ItemIcon size={15} className="shrink-0 opacity-90" />
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            <MoveUpRight size={13} className="shrink-0 opacity-60" />
                          </a>
                        )}
                      />
                    );
                  }

                  return (
                    <DropdownMenuItem
                      key={key}
                      className={itemClass}
                      render={(props) => (
                        <Link
                          {...props}
                          href={item.href}
                          title={item.description}
                          onClick={(e) => {
                            onLinkClick?.();
                            props.onClick?.(e);
                          }}
                          className={cn(
                            'flex w-full cursor-pointer items-center gap-2',
                            itemClass,
                            props.className
                          )}
                        >
                          <ItemIcon size={15} className="shrink-0 opacity-90" />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        </Link>
                      )}
                    />
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function PortfolioSidebarInner({ pathname, navMenus }: { pathname: string; navMenus: NavMenuSection[] }) {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { state, isMobile, setOpenMobile } = useSidebar();
  const iconOnly = state === 'collapsed';

  const onLinkClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 750);
  };

  return (
    <>
      <SidebarHeader className="relative gap-3 border-b border-sidebar-border/80 p-4">
        <SidebarToggleButton />
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center gap-3 rounded-[1.4rem] py-1 pr-10 transition-colors hover:bg-sidebar-accent/30"
        >
          <div className="sidebar-logo-wrap shrink-0">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full bg-zinc-900/60 p-1 logo-hover-green"
            />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block text-xs uppercase tracking-[0.28em] text-sidebar-foreground/60">Ben Garrard</span>
            <span className="font-display text-xl tracking-tight text-sidebar-foreground">Story, sound, systems</span>
          </div>
        </Link>

        <CollapsedPrimaryLinks pathname={pathname} onLinkClick={onLinkClick} />

        <div className="group-data-[collapsible=icon]:hidden">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/30 p-1">
            <Link
              href="/"
              onClick={onLinkClick}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              }`}
            >
              <Home size={14} />
              <span>Home</span>
            </Link>
            <Link
              href="/resumes"
              onClick={onLinkClick}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                pathname === '/resumes' || pathname.startsWith('/resumes/')
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              }`}
            >
              <FileText size={14} />
              <span>Resumes</span>
            </Link>
            <Link
              href="/docs"
              onClick={onLinkClick}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                pathname === '/docs' || pathname.startsWith('/docs/')
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              }`}
            >
              <ScrollText size={14} />
              <span>Docs</span>
            </Link>
            <Link
              href="/projects"
              onClick={onLinkClick}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                pathname === '/projects' || pathname.startsWith('/projects/')
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              }`}
            >
              <Compass size={14} />
              <span>Projects</span>
            </Link>
            <Link
              href="/apps"
              onClick={onLinkClick}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                pathname &&
                pathname !== '/apps/reader' &&
                !pathname.startsWith('/apps/reader/') &&
                (pathname === '/apps' || pathname.startsWith('/apps/'))
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Apps</span>
            </Link>
            <Link
              href="/apps/reader"
              onClick={onLinkClick}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                pathname === '/apps/reader' || pathname?.startsWith('/apps/reader/')
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              }`}
            >
              <LibraryBig size={14} />
              <span>Books</span>
            </Link>
            <Link
              href="/listen"
              onClick={onLinkClick}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                pathname === '/listen' || pathname.startsWith('/listen/')
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              }`}
            >
              <Headphones size={14} />
              <span>Songs</span>
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              onClick={onLinkClick}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>
          </div>
        </div>

      </SidebarHeader>

      <SidebarContent
        className={`px-2 py-3 ${isScrolling ? 'scroll-active' : ''}`}
        onScroll={handleScroll}
      >
        {pathname === '/apps/reader' || pathname.startsWith('/apps/reader/') ? (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Reader</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive
                    className="border border-transparent data-active:border-sidebar-ring/50"
                    render={<Link href="/apps/reader" onClick={onLinkClick} />}
                  >
                    <LibraryBig size={17} />
                    <span>Shelf</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="border border-transparent data-active:border-sidebar-ring/50"
                    render={<Link href="/apps" onClick={onLinkClick} />}
                  >
                    <LayoutGrid size={17} />
                    <span>All apps</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
        <NavMenuSections pathname={pathname} navMenus={navMenus} onLinkClick={onLinkClick} />
      </SidebarContent>

      <SidebarFooter className="gap-3 border-t border-sidebar-border/80 p-4">
        <a
          href={CONTACT_HREF}
          target="_blank"
          rel="noreferrer"
          title="Get in touch"
          className={cn(
            'inline-flex w-full items-center justify-center gap-2 rounded-full bg-sidebar-primary px-4 py-2.5 text-sm font-medium text-sidebar-primary-foreground transition hover:opacity-90',
            'group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:min-w-0 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center'
          )}
        >
          <Mail className="size-4 shrink-0" aria-hidden />
          <span className="group-data-[collapsible=icon]:sr-only">Get in touch</span>
        </a>

        <PlanningPackSidebarButton collapsed={iconOnly} />

        {process.env.NODE_ENV === 'development' ? (
          <Link
            href="/admin"
            onClick={onLinkClick}
            className="inline-flex items-center gap-2 text-xs font-medium text-sidebar-foreground/65 transition-colors hover:text-sidebar-foreground"
          >
            <Settings size={16} />
            Admin
          </Link>
        ) : null}
      </SidebarFooter>
    </>
  );
}

export default function Nav({
  navMenus,
  portfolioSidebarHoverHandlers,
}: {
  navMenus: NavMenuSection[];
  portfolioSidebarHoverHandlers?: {
    onMouseEnter?: MouseEventHandler<HTMLDivElement>;
    onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  };
}) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex border-b border-border/80 bg-dark-alt/85 px-4 py-4 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="sidebar-logo-wrap shrink-0">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full bg-zinc-900/60 p-1 logo-hover-green"
              />
            </div>
            <div className="min-w-0">
              <span className="block text-xs uppercase tracking-[0.28em] text-text-muted">Ben Garrard</span>
              <span className="font-display text-lg text-primary">Story, sound, systems</span>
            </div>
          </Link>

          <SidebarTrigger className="shrink-0 border-border bg-dark text-text-muted hover:bg-dark-elevated hover:text-primary" />
        </div>
      </div>

      <Sidebar
        collapsible="icon"
        className="z-10 border-r border-sidebar-border/80 bg-sidebar/90 backdrop-blur-xl"
        {...portfolioSidebarHoverHandlers}
      >
        <PortfolioSidebarInner pathname={pathname ?? ''} navMenus={navMenus} />
        <SidebarRail />
      </Sidebar>
    </>
  );
}
