import type { ContentEntry, ContentLink, ContentMeta } from '@/lib/content';
import { getAllContentEntries, getContentBySlug } from '@/lib/content';
import {
  readPublicMediaManifest,
  resolvePublicMediaRecordFromManifest,
  resolvePublicMediaUrlFromManifest,
} from '@/lib/public-media';
import {
  toSiteDownloadLinks,
} from '@/lib/site-download-assets';
import { runProjectRecordsWorker } from '@/lib/project-records-worker-runner';

type ProjectRecordDoc = Partial<
  Record<
    | 'slug'
    | 'title'
    | 'description'
    | 'date'
    | 'updated'
    | 'status'
    | 'featured'
    | 'featuredOrder'
    | 'featuredImage'
    | 'githubUrl'
    | 'liveUrl'
    | 'appUrl'
    | 'appLabel'
    | 'published',
    unknown
  > & {
    tags?: unknown;
    images?: unknown;
    appLinks?: unknown;
    links?: unknown;
    searchKeywords?: unknown;
    media?: unknown;
    downloadAssets?: unknown;
  }
>;

type ProjectMediaItem = {
  type: string;
  src?: string;
  url?: string;
  title?: string;
  thumbnail?: string;
};

function asString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null;
}

function asStringArray(value: unknown, key: string) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      return asString((entry as Record<string, unknown>)[key]);
    })
    .filter((entry): entry is string => Boolean(entry));

  return items.length > 0 ? items : undefined;
}

function asLinkArray(value: unknown): ContentLink[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const label = asString(record.label);
      const href = asString(record.href);

      if (!label || !href) {
        return null;
      }

      return {
        label,
        href,
        ...(asString(record.description) ? { description: asString(record.description) ?? undefined } : {}),
        ...(asString(record.kind) ? { kind: asString(record.kind) ?? undefined } : {}),
        ...(typeof record.external === 'boolean' ? { external: record.external } : {}),
      } satisfies ContentLink;
    })
    .filter((entry): entry is ContentLink => entry !== null);

  return items.length > 0 ? items : undefined;
}

function asMediaArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const mediaManifest = readPublicMediaManifest();
  const items = value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const type = asString(record.type);

      if (!type) {
        return null;
      }

      return resolvePublicMediaRecordFromManifest(mediaManifest, {
        type,
        ...(asString(record.src) ? { src: asString(record.src) ?? undefined } : {}),
        ...(asString(record.url) ? { url: asString(record.url) ?? undefined } : {}),
        ...(asString(record.title) ? { title: asString(record.title) ?? undefined } : {}),
        ...(asString(record.thumbnail)
          ? { thumbnail: asString(record.thumbnail) ?? undefined }
          : {}),
      }) satisfies ProjectMediaItem;
    })
    .filter((entry): entry is ProjectMediaItem => entry !== null);

  return items.length > 0 ? items : undefined;
}

function mergeProjectMeta(baseMeta: ContentMeta, record: ProjectRecordDoc | undefined): ContentMeta {
  if (!record) {
    return baseMeta;
  }

  const mediaManifest = readPublicMediaManifest();
  const tags = asStringArray(record.tags, 'tag');
  const images = asStringArray(record.images, 'image')?.map((image) =>
    resolvePublicMediaUrlFromManifest(mediaManifest, image),
  );
  const appLinks = asLinkArray(record.appLinks);
  const links = asLinkArray(record.links);
  const searchKeywords = asStringArray(record.searchKeywords, 'keyword');
  const media = asMediaArray(record.media);
  const downloads = toSiteDownloadLinks(record.downloadAssets);

  return {
    ...baseMeta,
    ...(asString(record.title) ? { title: asString(record.title) ?? baseMeta.title } : {}),
    ...(asString(record.description)
      ? { description: asString(record.description) ?? baseMeta.description }
      : {}),
    ...(asString(record.date) ? { date: asString(record.date) ?? baseMeta.date } : {}),
    ...(asString(record.updated) ? { updated: asString(record.updated) ?? baseMeta.updated } : {}),
    ...(asString(record.status) ? { status: asString(record.status) ?? baseMeta.status } : {}),
    ...(asBoolean(record.featured) !== null ? { featured: asBoolean(record.featured) ?? undefined } : {}),
    ...(asNumber(record.featuredOrder) !== null
      ? { featuredOrder: asNumber(record.featuredOrder) ?? undefined }
      : {}),
    ...(tags ? { tags } : {}),
    ...(asString(record.featuredImage)
      ? {
          featuredImage: resolvePublicMediaUrlFromManifest(
            mediaManifest,
            asString(record.featuredImage) ?? '',
          ),
        }
      : {}),
    ...(images ? { images } : {}),
    ...(asString(record.githubUrl)
      ? { githubUrl: asString(record.githubUrl) ?? baseMeta.githubUrl }
      : {}),
    ...(asString(record.liveUrl) ? { liveUrl: asString(record.liveUrl) ?? baseMeta.liveUrl } : {}),
    ...(asString(record.appUrl) ? { appUrl: asString(record.appUrl) ?? baseMeta.appUrl } : {}),
    ...(asString(record.appLabel)
      ? { appLabel: asString(record.appLabel) ?? baseMeta.appLabel }
      : {}),
    ...(appLinks ? { appLinks } : {}),
    ...(downloads ? { downloads } : {}),
    ...(links ? { links } : {}),
    ...(searchKeywords ? { searchKeywords } : {}),
    ...(media ? { media } : {}),
  };
}

function compareProjectEntries(a: ContentEntry, b: ContentEntry) {
  const orderA =
    typeof a.meta.featuredOrder === 'number' ? a.meta.featuredOrder : Number.MAX_SAFE_INTEGER;
  const orderB =
    typeof b.meta.featuredOrder === 'number' ? b.meta.featuredOrder : Number.MAX_SAFE_INTEGER;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  const featuredA = a.meta.featured ? 1 : 0;
  const featuredB = b.meta.featured ? 1 : 0;
  if (featuredA !== featuredB) {
    return featuredB - featuredA;
  }

  const dateA = new Date(a.meta.updated ?? a.meta.date ?? 0).getTime();
  const dateB = new Date(b.meta.updated ?? b.meta.date ?? 0).getTime();
  return dateB - dateA;
}

async function loadProjectRecords() {
  try {
    const result = await runProjectRecordsWorker();
    const body = result.body as
      | {
          ok?: boolean;
          projects?: unknown[];
        }
      | undefined;

    if (body?.ok && Array.isArray(body.projects) && body.projects.length > 0) {
      return body.projects as ProjectRecordDoc[];
    }
  } catch {
    // Fall back to repo-authored frontmatter when Payload is unavailable.
  }

  return [];
}

export async function getProjectEntries(): Promise<ContentEntry[]> {
  const baseEntries = getAllContentEntries('projects');
  const records = await loadProjectRecords();

  if (records.length === 0) {
    return baseEntries;
  }

  const recordMap = new Map(
    records
      .map((record) => {
        const slug = asString(record.slug);
        return slug ? [slug, record] : null;
      })
      .filter((entry): entry is [string, ProjectRecordDoc] => entry !== null),
  );

  return baseEntries
    .map((entry) => ({
      ...entry,
      meta: mergeProjectMeta(entry.meta, recordMap.get(entry.slug)),
    }))
    .sort(compareProjectEntries);
}

export async function getProjectSummaries() {
  const entries = await getProjectEntries();
  return entries.map((entry) => ({
    meta: entry.meta,
    slug: entry.slug,
  }));
}

export async function getProjectBySlug(slug: string): Promise<ContentEntry | null> {
  const project = getContentBySlug('projects', slug);
  if (!project) {
    return null;
  }

  const records = await loadProjectRecords();
  const record = records.find((candidate) => asString(candidate.slug) === slug);

  if (!record) {
    return project;
  }

  return {
    ...project,
    meta: mergeProjectMeta(project.meta, record),
  };
}
