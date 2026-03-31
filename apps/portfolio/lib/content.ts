import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import {
  readPublicMediaManifest,
  replacePublicMediaReferencesInSourceFromManifest,
  resolvePublicMediaRecordFromManifest,
  resolvePublicMediaUrlFromManifest,
} from '@/lib/public-media';

const contentDirectory = path.join(process.cwd(), 'content');

export type ContentType = 'docs' | 'projects' | 'blog';

export interface ContentLink {
  label: string;
  href: string;
  description?: string;
  kind?: string;
  external?: boolean;
}

export interface ContentHeading {
  id: string;
  text: string;
  level: number;
}

export interface ContentMeta {
  title: string;
  slug: string;
  description?: string;
  date?: string;
  updated?: string;
  tags?: string[];
  featuredImage?: string;
  image?: string;
  images?: string[];
  githubUrl?: string;
  liveUrl?: string;
  status?: string;
  featured?: boolean;
  featuredOrder?: number;
  appUrl?: string;
  appLabel?: string;
  appLinks?: ContentLink[];
  downloads?: ContentLink[];
  links?: ContentLink[];
  searchKeywords?: string[];
  media?: Array<Record<string, unknown>>;
  [key: string]:
    | string
    | string[]
    | number
    | boolean
    | ContentLink[]
    | Array<Record<string, unknown>>
    | undefined;
}

export interface ContentEntry {
  meta: ContentMeta;
  slug: string;
  href: string;
  content: string;
  plainText: string;
  headings: ContentHeading[];
  missingRequiredSections: string[];
}

type MarkedToken = {
  type?: string;
  depth?: number;
  text?: string;
  raw?: string;
  tokens?: MarkedToken[];
  items?: Array<{ text?: string; tokens?: MarkedToken[] }>;
  header?: Array<{ text?: string; tokens?: MarkedToken[] }>;
  rows?: Array<Array<{ text?: string; tokens?: MarkedToken[] }>>;
};

const BLOG_REQUIRED_HEADINGS = [
  'Downloads & Resources',
  'Introduction',
  'Tradeoffs',
  'What Was Done',
  'Conclusion',
  'Examples',
] as const;

const PROJECT_REQUIRED_HEADINGS = [
  'Links & Downloads',
  'Overview',
  'Role & Context',
  'Tradeoffs',
  'Implementation',
  'Outcomes',
  'Examples & Media',
] as const;

function getRequiredSectionHeadings(type: ContentType): readonly string[] {
  if (type === 'blog') return BLOG_REQUIRED_HEADINGS;
  if (type === 'projects') return PROJECT_REQUIRED_HEADINGS;
  return [];
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function normalizeSectionLabel(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function safeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((item): item is string => typeof item === 'string');
  return items.length > 0 ? items : undefined;
}

function safeLinkArray(value: unknown): ContentLink[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const items = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      if (typeof record.href !== 'string' || typeof record.label !== 'string') return null;
      return {
        label: record.label,
        href: record.href,
        ...(typeof record.description === 'string' ? { description: record.description } : {}),
        ...(typeof record.kind === 'string' ? { kind: record.kind } : {}),
        ...(typeof record.external === 'boolean' ? { external: record.external } : {}),
      } satisfies ContentLink;
    })
    .filter((item): item is ContentLink => item !== null);

  return items.length > 0 ? items : undefined;
}

function normalizeContentMeta(meta: Record<string, unknown>, slug: string, fileModifiedDate: string): ContentMeta {
  const mediaManifest = readPublicMediaManifest();

  return {
    ...meta,
    slug,
    title: typeof meta.title === 'string' ? meta.title : slug,
    description: typeof meta.description === 'string' ? meta.description : undefined,
    date: typeof meta.date === 'string' ? meta.date : fileModifiedDate,
    updated: typeof meta.updated === 'string' ? meta.updated : fileModifiedDate,
    tags: safeStringArray(meta.tags),
    featuredImage:
      typeof meta.featuredImage === 'string'
        ? resolvePublicMediaUrlFromManifest(mediaManifest, meta.featuredImage)
        : undefined,
    image:
      typeof meta.image === 'string'
        ? resolvePublicMediaUrlFromManifest(mediaManifest, meta.image)
        : undefined,
    images: safeStringArray(meta.images)?.map((entry) =>
      resolvePublicMediaUrlFromManifest(mediaManifest, entry),
    ),
    githubUrl: typeof meta.githubUrl === 'string' ? meta.githubUrl : undefined,
    liveUrl: typeof meta.liveUrl === 'string' ? meta.liveUrl : undefined,
    status: typeof meta.status === 'string' ? meta.status : undefined,
    featured: typeof meta.featured === 'boolean' ? meta.featured : undefined,
    featuredOrder: typeof meta.featuredOrder === 'number' ? meta.featuredOrder : undefined,
    appUrl: typeof meta.appUrl === 'string' ? meta.appUrl : undefined,
    appLabel: typeof meta.appLabel === 'string' ? meta.appLabel : undefined,
    appLinks: safeLinkArray(meta.appLinks),
    downloads: safeLinkArray(meta.downloads),
    links: safeLinkArray(meta.links),
    searchKeywords: safeStringArray(meta.searchKeywords),
    media: Array.isArray(meta.media)
      ? meta.media
          .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
          .map((item) => resolvePublicMediaRecordFromManifest(mediaManifest, item))
      : undefined,
  };
}

function collectTextFromTokens(tokens: MarkedToken[] | undefined, textParts: string[], headings: ContentHeading[]) {
  if (!tokens) return;

  for (const token of tokens) {
    if (typeof token.text === 'string' && token.text.trim()) {
      textParts.push(token.text.trim());
    }

    if (token.type === 'heading' && typeof token.depth === 'number' && token.depth >= 2 && token.depth <= 4 && typeof token.text === 'string') {
      headings.push({
        id: slugifyHeading(token.text),
        text: token.text.trim(),
        level: token.depth,
      });
    }

    if (Array.isArray(token.header)) {
      for (const cell of token.header) {
        if (typeof cell.text === 'string' && cell.text.trim()) {
          textParts.push(cell.text.trim());
        }
        collectTextFromTokens(cell.tokens, textParts, headings);
      }
    }

    if (Array.isArray(token.rows)) {
      for (const row of token.rows) {
        for (const cell of row) {
          if (typeof cell.text === 'string' && cell.text.trim()) {
            textParts.push(cell.text.trim());
          }
          collectTextFromTokens(cell.tokens, textParts, headings);
        }
      }
    }

    if (Array.isArray(token.items)) {
      for (const item of token.items) {
        if (typeof item.text === 'string' && item.text.trim()) {
          textParts.push(item.text.trim());
        }
        collectTextFromTokens(item.tokens, textParts, headings);
      }
    }

    collectTextFromTokens(token.tokens, textParts, headings);
  }
}

function uniqueHeadings(headings: ContentHeading[]): ContentHeading[] {
  const counts = new Map<string, number>();
  return headings.map((heading) => {
    const count = counts.get(heading.id) ?? 0;
    counts.set(heading.id, count + 1);
    if (count === 0) return heading;
    return {
      ...heading,
      id: `${heading.id}-${count + 1}`,
    };
  });
}

function parseContentBody(content: string) {
  const tokens = marked.lexer(content) as MarkedToken[];
  const textParts: string[] = [];
  const headings: ContentHeading[] = [];
  collectTextFromTokens(tokens, textParts, headings);

  return {
    plainText: textParts.join(' ').replace(/\s+/g, ' ').trim(),
    headings: uniqueHeadings(headings),
  };
}

function getDateTimestamp(dateString: string | undefined): number {
  if (!dateString) return 0;
  const timestamp = new Date(dateString).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getContentHref(type: ContentType, slug: string): string {
  return `/${type}/${slug}`;
}

function getMissingRequiredSections(type: ContentType, headings: ContentHeading[]): string[] {
  const required = getRequiredSectionHeadings(type);
  if (required.length === 0) return [];

  const present = new Set(headings.map((heading) => normalizeSectionLabel(heading.text)));
  return required.filter((heading) => !present.has(normalizeSectionLabel(heading)));
}

function sortEntries(type: ContentType, entries: ContentEntry[]): ContentEntry[] {
  return entries.sort((a, b) => {
    if (type === 'projects') {
      const featuredOrderA = typeof a.meta.featuredOrder === 'number' ? a.meta.featuredOrder : Number.MAX_SAFE_INTEGER;
      const featuredOrderB = typeof b.meta.featuredOrder === 'number' ? b.meta.featuredOrder : Number.MAX_SAFE_INTEGER;
      if (featuredOrderA !== featuredOrderB) return featuredOrderA - featuredOrderB;

      const featuredA = a.meta.featured ? 1 : 0;
      const featuredB = b.meta.featured ? 1 : 0;
      if (featuredA !== featuredB) return featuredB - featuredA;
    }

    const dateA = a.meta.updated ? getDateTimestamp(a.meta.updated) : getDateTimestamp(a.meta.date);
    const dateB = b.meta.updated ? getDateTimestamp(b.meta.updated) : getDateTimestamp(b.meta.date);
    return dateB - dateA;
  });
}

export function getContentFiles(type: ContentType): string[] {
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

export function getContentBySlug(
  type: ContentType,
  slug: string
): (ContentEntry & { meta: ContentMeta; content: string }) | null {
  const typeDir = path.join(contentDirectory, type);
  const files = getContentFiles(type);

  const file = files.find((candidate) => {
    const fileSlug = candidate.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
    return fileSlug === slug;
  });

  if (!file) return null;

  const filePath = path.join(typeDir, file);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  const stats = fs.statSync(filePath);
  const fileModifiedDate = stats.mtime.toISOString().split('T')[0];
  const meta = normalizeContentMeta(data, slug, fileModifiedDate);
  const resolvedContent = replacePublicMediaReferencesInSourceFromManifest(
    readPublicMediaManifest(),
    content,
  );
  const parsed = parseContentBody(resolvedContent);

  return {
    meta,
    slug,
    href: getContentHref(type, slug),
    content: resolvedContent,
    plainText: parsed.plainText,
    headings: parsed.headings,
    missingRequiredSections: getMissingRequiredSections(type, parsed.headings),
  };
}

export function getAllContentEntries(type: ContentType): ContentEntry[] {
  const files = getContentFiles(type);

  const entries = files
    .map((file) => {
      const slug = file.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
      return getContentBySlug(type, slug);
    })
    .filter((item): item is ContentEntry => item !== null);

  return sortEntries(type, entries);
}

export function getAllContent(type: ContentType): Array<{ meta: ContentMeta; slug: string }> {
  return getAllContentEntries(type).map((entry) => ({
    meta: entry.meta,
    slug: entry.slug,
  }));
}
