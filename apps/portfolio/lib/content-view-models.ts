import type { ContentEntry, ContentLink, ContentMeta } from '@/lib/content';
import type { DiscoveryItem, DiscoveryKind, DiscoveryLink } from '@/lib/content-discovery';

function normalizeLink(link: ContentLink, fallbackKind: string): DiscoveryLink {
  const isExternal = typeof link.external === 'boolean' ? link.external : /^(https?:)?\/\//.test(link.href);
  return {
    ...link,
    kind: link.kind ?? fallbackKind,
    external: isExternal,
  };
}

function pushLink(
  target: DiscoveryLink[],
  href: string | undefined,
  label: string,
  kind: string,
  description?: string
) {
  if (!href) return;
  target.push({
    href,
    label,
    kind,
    description,
    external: /^(https?:)?\/\//.test(href),
  });
}

export function buildContentLinkGroups(meta: ContentMeta) {
  const appLinks = (meta.appLinks ?? []).map((link) => normalizeLink(link, 'app'));
  const downloads = (meta.downloads ?? []).map((link) => normalizeLink(link, 'download'));
  const links = (meta.links ?? []).map((link) => normalizeLink(link, 'resource'));

  pushLink(appLinks, meta.appUrl, meta.appLabel ?? 'Open App', 'app', 'Associated application');
  pushLink(links, meta.githubUrl, 'GitHub', 'github', 'Repository and source code');
  if (!meta.appUrl || meta.liveUrl !== meta.appUrl) {
    pushLink(links, meta.liveUrl, meta.appUrl ? 'Live Demo' : 'Open App / Demo', 'demo', 'Live route or demo');
  }

  return {
    appLinks,
    downloads,
    links,
    allTopLinks: [...appLinks, ...downloads, ...links],
  };
}

export function toDiscoveryItem(kind: DiscoveryKind, entry: ContentEntry): DiscoveryItem {
  const groups = buildContentLinkGroups(entry.meta);
  return {
    kind,
    slug: entry.slug,
    href: entry.href,
    title: entry.meta.title,
    description: entry.meta.description ?? '',
    date: entry.meta.date,
    updated: entry.meta.updated,
    year: entry.meta.date ? String(new Date(entry.meta.date).getFullYear()) : undefined,
    tags: entry.meta.tags ?? [],
    status: entry.meta.status,
    featured: entry.meta.featured,
    featuredOrder: entry.meta.featuredOrder,
    searchKeywords: entry.meta.searchKeywords ?? [],
    plainText: entry.plainText,
    headings: entry.headings,
    links: groups.links,
    downloads: groups.downloads,
    appLinks: groups.appLinks,
  };
}
