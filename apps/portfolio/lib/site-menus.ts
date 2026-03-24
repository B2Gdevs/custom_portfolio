import type { ContentMeta } from '@/lib/content';

export type NavIconKey =
  | 'book-open'
  | 'book-text'
  | 'compass'
  | 'file-code'
  | 'file-text'
  | 'headphones'
  | 'home'
  | 'library'
  | 'mic'
  | 'move-up-right'
  | 'radio'
  | 'scroll'
  | 'sparkles'
  | 'wand';

export interface NavMenuItem {
  label: string;
  description: string;
  href: string;
  icon: NavIconKey;
  external?: boolean;
}

export interface NavMenuSection {
  id: string;
  label: string;
  description: string;
  icon: NavIconKey;
  accent: string;
  items: NavMenuItem[];
}

interface ContentLinkInput {
  slug: string;
  meta: ContentMeta;
}

interface BuildSiteMenusInput {
  projects: ContentLinkInput[];
  blogPosts: ContentLinkInput[];
}

function toTitle(item: ContentLinkInput | undefined, fallback: string): string {
  return item?.meta.title || fallback;
}

function nonRichEpubBlogPosts(posts: ContentLinkInput[]): ContentLinkInput[] {
  return posts.filter((post) => {
    const slug = post.slug.toLowerCase();
    return !slug.includes('richepub') && !slug.includes('repub');
  });
}

export function buildSiteMenus({
  projects,
  blogPosts,
}: BuildSiteMenusInput): NavMenuSection[] {
  const recentBlogPosts = nonRichEpubBlogPosts(blogPosts).slice(0, 2);
  const recentProjects = projects.slice(0, 2);

  return [
    {
      id: 'read',
      label: 'Read',
      description: 'Start with the book or open the full books index.',
      icon: 'library',
      accent: 'from-[#d9b17b]/35 to-transparent',
      items: [
        {
          label: 'Start Mordred\'s Tale',
          description: 'Jump straight into the in-browser reader.',
          href: '/books/mordreds_tale/read',
          icon: 'book-open',
        },
        {
          label: 'All Books',
          description: 'Browse every available reading edition.',
          href: '/books',
          icon: 'scroll',
        },
      ],
    },
    {
      id: 'listen',
      label: 'Listen',
      description: 'Open the listening room or jump directly to the current tracks.',
      icon: 'radio',
      accent: 'from-[#6f88a3]/30 to-transparent',
      items: [
        {
          label: 'Listening Room',
          description: 'See the current songs and embedded players.',
          href: '/listen',
          icon: 'headphones',
        },
        {
          label: 'Demon Child',
          description: 'Open the BandLab track page.',
          href: 'https://www.bandlab.com/track/4ae1c92d-8d48-407b-b460-8181a6266388?revId=f336ded5-ebae-487c-8e3e-e2f6319a2aa0',
          icon: 'mic',
          external: true,
        },
        {
          label: 'Greed 3.0',
          description: 'Open the second BandLab track page.',
          href: 'https://www.bandlab.com/track/1637d69f-33d5-f011-819b-6045bd3096b1?revId=1437d69f-33d5-f011-819b-6045bd3096b1',
          icon: 'radio',
          external: true,
        },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      description: 'Products, prototypes, and the strongest implementation case studies.',
      icon: 'wand',
      accent: 'from-[#7e8f73]/28 to-transparent',
      items: [
        {
          label: 'All Projects',
          description: 'Browse the full projects grid.',
          href: '/projects',
          icon: 'compass',
        },
        {
          label: toTitle(recentProjects[0], 'Latest Project'),
          description: 'Newest project entry.',
          href: recentProjects[0] ? `/projects/${recentProjects[0].slug}` : '/projects',
          icon: 'sparkles',
        },
        {
          label: toTitle(recentProjects[1], 'Recent Project'),
          description: 'Another recent project page.',
          href: recentProjects[1] ? `/projects/${recentProjects[1].slug}` : '/projects',
          icon: 'wand',
        },
        {
          label: 'DungeonBreak Docs (Live)',
          description: 'Open the side project currently in active development.',
          href: 'https://dungeon-break-docs.vercel.app/',
          icon: 'move-up-right',
          external: true,
        },
        {
          label: 'GitHub + Stats',
          description: 'Quick access to repositories, activity, and contribution stats.',
          href: 'https://github.com/B2Gdevs',
          icon: 'file-code',
          external: true,
        },
      ],
    },
    {
      id: 'blog',
      label: 'Blog',
      description: 'Essays, build notes, and narrative reflections.',
      icon: 'book-text',
      accent: 'from-[#9b6f57]/26 to-transparent',
      items: [
        {
          label: 'All Posts',
          description: 'Open the blog index.',
          href: '/blog',
          icon: 'file-text',
        },
        {
          label: toTitle(recentBlogPosts[0], 'Latest Post'),
          description: 'Most recent blog post.',
          href: recentBlogPosts[0] ? `/blog/${recentBlogPosts[0].slug}` : '/blog',
          icon: 'book-text',
        },
        {
          label: toTitle(recentBlogPosts[1], 'Recent Post'),
          description: 'Another recent blog post.',
          href: recentBlogPosts[1] ? `/blog/${recentBlogPosts[1].slug}` : '/blog',
          icon: 'scroll',
        },
      ],
    },
  ];
}
