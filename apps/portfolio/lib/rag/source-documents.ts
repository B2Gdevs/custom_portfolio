import { createHash } from 'node:crypto';
import { getAllContent, getContentBySlug } from '@/lib/content';
import { ragIngestCorpus } from './ingest-corpus.config';
import type { RagContentType } from './ingest-corpus.config';
import type { RagSourceDocument, RagSourceKind } from './types';

const EXCLUDED_DOC_LEAF_SLUGS = new Set<string>(ragIngestCorpus.excludedDocLeafSlugs);

function hashContent(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function isSearchableDocSlug(slug: string): boolean {
  const leaf = slug.split('/').at(-1) ?? slug;
  return !EXCLUDED_DOC_LEAF_SLUGS.has(leaf);
}

function getDocKind(slug: string): RagSourceKind {
  return slug.startsWith('magicborn/') ? 'magicborn' : 'doc';
}

function getDocScope(slug: string): string {
  return slug.startsWith('magicborn/') ? 'magicborn' : (slug.split('/')[0] ?? 'docs');
}

function getPublicUrl(type: 'docs' | 'projects' | 'blog', slug: string): string {
  if (type === 'docs') {
    return `/docs/${slug}`;
  }
  if (type === 'projects') {
    return `/projects/${slug}`;
  }
  return `/blog/${slug}`;
}

function getSourcePath(type: 'docs' | 'projects' | 'blog', slug: string): string {
  return `apps/portfolio/content/${type}/${slug}.mdx`;
}

function buildDocument(
  type: 'docs' | 'projects' | 'blog',
  slug: string,
): RagSourceDocument | null {
  if (type === 'docs' && !isSearchableDocSlug(slug)) {
    return null;
  }

  const item = getContentBySlug(type, slug);
  if (!item) {
    return null;
  }

  const kind =
    type === 'docs'
      ? getDocKind(slug)
      : type === 'projects'
        ? 'project'
        : 'blog';
  const scope =
    type === 'docs'
      ? getDocScope(slug)
      : type === 'projects'
        ? 'projects'
        : 'blog';

  return {
    sourceId: `${type}:${slug}`,
    title: item.meta.title,
    description: item.meta.description ?? '',
    kind,
    scope,
    slug,
    sourcePath: getSourcePath(type, slug),
    publicUrl: getPublicUrl(type, slug),
    updatedAt: item.meta.updated ?? item.meta.date ?? new Date().toISOString(),
    checksum: hashContent(
      JSON.stringify({
        meta: item.meta,
        content: item.content,
      }),
    ),
    body: item.content,
    meta: item.meta,
  };
}

export function getRagSourceDocuments(): RagSourceDocument[] {
  const documents: RagSourceDocument[] = [];

  for (const type of ragIngestCorpus.contentTypes) {
    for (const slug of getAllContent(type).map((entry) => entry.slug)) {
      const doc = buildDocument(type, slug);
      if (doc) {
        documents.push(doc);
      }
    }
  }

  return documents.sort((a, b) => a.sourceId.localeCompare(b.sourceId));
}
