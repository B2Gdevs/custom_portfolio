import type { ComponentType } from 'react';
import {
  BookOpenText,
  BookText,
  Compass,
  FileCode2,
  FileText,
  Headphones,
  Home,
  LayoutGrid,
  LibraryBig,
  Mic2,
  MoveUpRight,
  Radio,
  ScrollText,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import type { NavIconKey } from '@/lib/site-menus';

export const GITHUB_URL = 'https://github.com/B2Gdevs';

/** Public contact link only — no email shown in the UI. Override with NEXT_PUBLIC_CONTACT_HREF. */
export const CONTACT_HREF =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_CONTACT_HREF?.trim()
    ? process.env.NEXT_PUBLIC_CONTACT_HREF.trim()
    : GITHUB_URL;

export const DEFAULT_SITE_LOGO = '/logo.svg';

export const navIconMap: Record<
  NavIconKey,
  ComponentType<{ size?: number; className?: string }>
> = {
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

/** Icon rail primary links (collapsed sidebar). */
export const primaryNavItems: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
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
