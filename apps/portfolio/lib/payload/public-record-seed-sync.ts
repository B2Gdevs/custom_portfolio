import pg from 'pg';
import type { ContentEntry } from '@/lib/content';
import { getPayloadClient } from '@/lib/payload';
import { getPayloadDatabaseUrl, isPayloadUsingPostgres } from '@/lib/payload/runtime-env';

export type SeedSummary = {
  created: number;
  updated: number;
  skipped: number;
};

type SeedLink = {
  label: string;
  href: string;
  description: string | null;
  kind: string | null;
  external: boolean;
};

type SeedMedia = {
  type: string;
  src: string | null;
  url: string | null;
  title: string | null;
  thumbnail: string | null;
};

export type SeedProjectRecord = {
  title: string;
  slug: string;
  description: string;
  date: string | null;
  updated: string | null;
  status: string | null;
  featured: boolean;
  featuredOrder: number;
  tags: string[];
  featuredImage: string | null;
  images: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  appUrl: string | null;
  appLabel: string | null;
  appLinks: SeedLink[];
  links: SeedLink[];
  searchKeywords: string[];
  media: SeedMedia[];
  downloadAssetIds: string[];
  published: boolean;
};

export type SeedResumeRecord = {
  title: string;
  slug: string;
  fileName: string;
  role: string;
  summary: string;
  featuredOrder: number;
  downloadAssetIds: string[];
  published: boolean;
};

type ProjectSourceRecord = Pick<ContentEntry, 'slug' | 'meta'>;

type ResumeSourceRecord = {
  slug: string;
  fileName: string;
  title: string;
  role: string;
  summary: string;
  featuredOrder: number;
};

type PgRow = Record<string, unknown>;

type ExistingPgProjectRecord = {
  id: number;
  record: SeedProjectRecord;
};

type ExistingPgResumeRecord = {
  id: number;
  record: SeedResumeRecord;
};

function asString(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return null;
}

function asNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function asBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function normalizeOptionalString(value: unknown) {
  const normalized = asString(value)?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

function normalizeRequiredString(value: unknown, fallback = '') {
  return asString(value)?.trim() ?? fallback;
}

function normalizeDate(value: unknown) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function normalizeStringArray(items: unknown, key?: string) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (key && isRecord(item)) {
        return normalizeOptionalString(item[key]);
      }

      return normalizeOptionalString(item);
    })
    .filter((item): item is string => Boolean(item));
}

function normalizeLinkArray(items: unknown): SeedLink[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const label = normalizeOptionalString(item.label);
      const href = normalizeOptionalString(item.href);
      if (!label || !href) {
        return null;
      }

      return {
        label,
        href,
        description: normalizeOptionalString(item.description),
        kind: normalizeOptionalString(item.kind),
        external: asBoolean(item.external) ?? false,
      } satisfies SeedLink;
    })
    .filter((item): item is SeedLink => item !== null);
}

function normalizeMediaArray(items: unknown): SeedMedia[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const type = normalizeOptionalString(item.type);
      if (!type) {
        return null;
      }

      return {
        type,
        src: normalizeOptionalString(item.src),
        url: normalizeOptionalString(item.url),
        title: normalizeOptionalString(item.title),
        thumbnail: normalizeOptionalString(item.thumbnail),
      } satisfies SeedMedia;
    })
    .filter((item): item is SeedMedia => item !== null);
}

function normalizeRelationshipIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === 'string' || typeof entry === 'number') {
        return String(entry);
      }

      if (isRecord(entry)) {
        return asString(entry.id);
      }

      return null;
    })
    .filter((entry): entry is string => Boolean(entry))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function sortDownloadIds(ids: string[]) {
  return [...ids].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export function toSeedProjectRecord(
  project: ProjectSourceRecord,
  downloadAssetIds: string[] = [],
): SeedProjectRecord {
  return {
    title: normalizeRequiredString(project.meta.title, project.slug),
    slug: project.slug,
    description: normalizeRequiredString(project.meta.description, ''),
    date: normalizeDate(project.meta.date),
    updated: normalizeDate(project.meta.updated),
    status: normalizeOptionalString(project.meta.status),
    featured: Boolean(project.meta.featured),
    featuredOrder: asNumber(project.meta.featuredOrder) ?? 0,
    tags: normalizeStringArray(project.meta.tags),
    featuredImage: normalizeOptionalString(project.meta.featuredImage),
    images: normalizeStringArray(project.meta.images),
    githubUrl: normalizeOptionalString(project.meta.githubUrl),
    liveUrl: normalizeOptionalString(project.meta.liveUrl),
    appUrl: normalizeOptionalString(project.meta.appUrl),
    appLabel: normalizeOptionalString(project.meta.appLabel),
    appLinks: normalizeLinkArray(project.meta.appLinks),
    links: normalizeLinkArray(project.meta.links),
    searchKeywords: normalizeStringArray(project.meta.searchKeywords),
    media: normalizeMediaArray(project.meta.media),
    downloadAssetIds: sortDownloadIds(downloadAssetIds),
    published: true,
  };
}

export function toSeedResumeRecord(
  resume: ResumeSourceRecord,
  downloadAssetIds: string[] = [],
): SeedResumeRecord {
  return {
    title: normalizeRequiredString(resume.title),
    slug: resume.slug,
    fileName: normalizeRequiredString(resume.fileName),
    role: normalizeRequiredString(resume.role),
    summary: normalizeRequiredString(resume.summary),
    featuredOrder: asNumber(resume.featuredOrder) ?? 0,
    downloadAssetIds: sortDownloadIds(downloadAssetIds),
    published: true,
  };
}

export function toSeedProjectRecordFromPayloadDoc(
  doc: unknown,
  includeDownloadAssets: boolean,
): SeedProjectRecord | null {
  if (!isRecord(doc)) {
    return null;
  }

  const slug = normalizeOptionalString(doc.slug);
  const title = normalizeOptionalString(doc.title);
  if (!slug || !title) {
    return null;
  }

  return {
    title,
    slug,
    description: normalizeRequiredString(doc.description, ''),
    date: normalizeDate(doc.date),
    updated: normalizeDate(doc.updated),
    status: normalizeOptionalString(doc.status),
    featured: asBoolean(doc.featured) ?? false,
    featuredOrder: asNumber(doc.featuredOrder) ?? 0,
    tags: normalizeStringArray(doc.tags, 'tag'),
    featuredImage: normalizeOptionalString(doc.featuredImage),
    images: normalizeStringArray(doc.images, 'image'),
    githubUrl: normalizeOptionalString(doc.githubUrl),
    liveUrl: normalizeOptionalString(doc.liveUrl),
    appUrl: normalizeOptionalString(doc.appUrl),
    appLabel: normalizeOptionalString(doc.appLabel),
    appLinks: normalizeLinkArray(doc.appLinks),
    links: normalizeLinkArray(doc.links),
    searchKeywords: normalizeStringArray(doc.searchKeywords, 'keyword'),
    media: normalizeMediaArray(doc.media),
    downloadAssetIds: includeDownloadAssets ? normalizeRelationshipIds(doc.downloadAssets) : [],
    published: asBoolean(doc.published) ?? true,
  };
}

export function toSeedResumeRecordFromPayloadDoc(
  doc: unknown,
  includeDownloadAssets: boolean,
): SeedResumeRecord | null {
  if (!isRecord(doc)) {
    return null;
  }

  const slug = normalizeOptionalString(doc.slug);
  const title = normalizeOptionalString(doc.title);
  const fileName = normalizeOptionalString(doc.fileName);
  const role = normalizeOptionalString(doc.role);
  const summary = normalizeOptionalString(doc.summary);

  if (!slug || !title || !fileName || !role || !summary) {
    return null;
  }

  return {
    title,
    slug,
    fileName,
    role,
    summary,
    featuredOrder: asNumber(doc.featuredOrder) ?? 0,
    downloadAssetIds: includeDownloadAssets ? normalizeRelationshipIds(doc.downloadAssets) : [],
    published: asBoolean(doc.published) ?? true,
  };
}

export function projectSeedFingerprint(record: SeedProjectRecord) {
  return JSON.stringify(record);
}

export function resumeSeedFingerprint(record: SeedResumeRecord) {
  return JSON.stringify(record);
}

function createProjectPayloadData(record: SeedProjectRecord) {
  return {
    title: record.title,
    slug: record.slug,
    description: record.description,
    date: record.date ?? undefined,
    updated: record.updated ?? undefined,
    status: record.status ?? undefined,
    featured: record.featured,
    featuredOrder: record.featuredOrder,
    tags: record.tags.map((tag) => ({ tag })),
    featuredImage: record.featuredImage ?? undefined,
    images: record.images.map((image) => ({ image })),
    githubUrl: record.githubUrl ?? undefined,
    liveUrl: record.liveUrl ?? undefined,
    appUrl: record.appUrl ?? undefined,
    appLabel: record.appLabel ?? undefined,
    appLinks: record.appLinks.map((link) => ({
      label: link.label,
      href: link.href,
      description: link.description ?? undefined,
      kind: link.kind ?? undefined,
      external: link.external,
    })),
    links: record.links.map((link) => ({
      label: link.label,
      href: link.href,
      description: link.description ?? undefined,
      kind: link.kind ?? undefined,
      external: link.external,
    })),
    searchKeywords: record.searchKeywords.map((keyword) => ({ keyword })),
    media: record.media.map((item) => ({
      type: item.type,
      src: item.src ?? undefined,
      url: item.url ?? undefined,
      title: item.title ?? undefined,
      thumbnail: item.thumbnail ?? undefined,
    })),
    published: record.published,
  };
}

function createResumePayloadData(record: SeedResumeRecord) {
  return {
    title: record.title,
    slug: record.slug,
    fileName: record.fileName,
    role: record.role,
    summary: record.summary,
    featuredOrder: record.featuredOrder,
    published: record.published,
  };
}

async function loadScopedAssetIds(client: pg.PoolClient, scope: 'project' | 'resume') {
  const result = await client.query<PgRow>(
    `
      SELECT id, content_slug
      FROM site_download_assets
      WHERE content_scope = $1
        AND is_current = true
    `,
    [scope],
  );

  const assetIdsBySlug = new Map<string, string[]>();

  for (const row of result.rows) {
    const slug = normalizeOptionalString(row.content_slug);
    const id = normalizeOptionalString(row.id);
    if (!slug || !id) {
      continue;
    }

    const existing = assetIdsBySlug.get(slug) ?? [];
    existing.push(id);
    assetIdsBySlug.set(slug, sortDownloadIds(existing));
  }

  return assetIdsBySlug;
}

async function loadExistingProjectRecordsPg(client: pg.PoolClient) {
  const baseRows = await client.query<PgRow>(
    `
      SELECT
        id,
        title,
        slug,
        description,
        date,
        updated,
        status,
        featured,
        featured_order,
        featured_image,
        github_url,
        live_url,
        app_url,
        app_label,
        published
      FROM project_records
    `,
  );
  const tagRows = await client.query<PgRow>(
    `SELECT _parent_id, _order, tag FROM project_records_tags ORDER BY _parent_id, _order`,
  );
  const imageRows = await client.query<PgRow>(
    `SELECT _parent_id, _order, image FROM project_records_images ORDER BY _parent_id, _order`,
  );
  const appLinkRows = await client.query<PgRow>(
    `SELECT _parent_id, _order, label, href, description, kind, external FROM project_records_app_links ORDER BY _parent_id, _order`,
  );
  const linkRows = await client.query<PgRow>(
    `SELECT _parent_id, _order, label, href, description, kind, external FROM project_records_links ORDER BY _parent_id, _order`,
  );
  const keywordRows = await client.query<PgRow>(
    `SELECT _parent_id, _order, keyword FROM project_records_search_keywords ORDER BY _parent_id, _order`,
  );
  const mediaRows = await client.query<PgRow>(
    `SELECT _parent_id, _order, type, src, url, title, thumbnail FROM project_records_media ORDER BY _parent_id, _order`,
  );
  const relRows = await client.query<PgRow>(
    `SELECT parent_id, "order", path, site_download_assets_id FROM project_records_rels ORDER BY parent_id, "order", id`,
  );

  const records = new Map<string, ExistingPgProjectRecord>();
  const byId = new Map<number, SeedProjectRecord>();

  for (const row of baseRows.rows) {
    const slug = normalizeOptionalString(row.slug);
    const id = asNumber(row.id);
    const title = normalizeOptionalString(row.title);
    if (!slug || id === null || !title) {
      continue;
    }

    const record: SeedProjectRecord = {
      title,
      slug,
      description: normalizeRequiredString(row.description, ''),
      date: normalizeDate(row.date),
      updated: normalizeDate(row.updated),
      status: normalizeOptionalString(row.status),
      featured: asBoolean(row.featured) ?? false,
      featuredOrder: asNumber(row.featured_order) ?? 0,
      tags: [],
      featuredImage: normalizeOptionalString(row.featured_image),
      images: [],
      githubUrl: normalizeOptionalString(row.github_url),
      liveUrl: normalizeOptionalString(row.live_url),
      appUrl: normalizeOptionalString(row.app_url),
      appLabel: normalizeOptionalString(row.app_label),
      appLinks: [],
      links: [],
      searchKeywords: [],
      media: [],
      downloadAssetIds: [],
      published: asBoolean(row.published) ?? true,
    };

    records.set(slug, { id, record });
    byId.set(id, record);
  }

  for (const row of tagRows.rows) {
    const parentId = asNumber(row._parent_id);
    const tag = normalizeOptionalString(row.tag);
    if (parentId === null || !tag) continue;
    byId.get(parentId)?.tags.push(tag);
  }

  for (const row of imageRows.rows) {
    const parentId = asNumber(row._parent_id);
    const image = normalizeOptionalString(row.image);
    if (parentId === null || !image) continue;
    byId.get(parentId)?.images.push(image);
  }

  for (const row of appLinkRows.rows) {
    const parentId = asNumber(row._parent_id);
    if (parentId === null) continue;

    const label = normalizeOptionalString(row.label);
    const href = normalizeOptionalString(row.href);
    if (!label || !href) continue;

    byId.get(parentId)?.appLinks.push({
      label,
      href,
      description: normalizeOptionalString(row.description),
      kind: normalizeOptionalString(row.kind),
      external: asBoolean(row.external) ?? false,
    });
  }

  for (const row of linkRows.rows) {
    const parentId = asNumber(row._parent_id);
    if (parentId === null) continue;

    const label = normalizeOptionalString(row.label);
    const href = normalizeOptionalString(row.href);
    if (!label || !href) continue;

    byId.get(parentId)?.links.push({
      label,
      href,
      description: normalizeOptionalString(row.description),
      kind: normalizeOptionalString(row.kind),
      external: asBoolean(row.external) ?? false,
    });
  }

  for (const row of keywordRows.rows) {
    const parentId = asNumber(row._parent_id);
    const keyword = normalizeOptionalString(row.keyword);
    if (parentId === null || !keyword) continue;
    byId.get(parentId)?.searchKeywords.push(keyword);
  }

  for (const row of mediaRows.rows) {
    const parentId = asNumber(row._parent_id);
    const type = normalizeOptionalString(row.type);
    if (parentId === null || !type) continue;

    byId.get(parentId)?.media.push({
      type,
      src: normalizeOptionalString(row.src),
      url: normalizeOptionalString(row.url),
      title: normalizeOptionalString(row.title),
      thumbnail: normalizeOptionalString(row.thumbnail),
    });
  }

  for (const row of relRows.rows) {
    const parentId = asNumber(row.parent_id);
    const path = normalizeOptionalString(row.path);
    const siteDownloadAssetId = normalizeOptionalString(row.site_download_assets_id);
    if (parentId === null || path !== 'downloadAssets' || !siteDownloadAssetId) {
      continue;
    }

    const record = byId.get(parentId);
    if (!record) {
      continue;
    }

    record.downloadAssetIds.push(siteDownloadAssetId);
  }

  for (const { record } of records.values()) {
    record.downloadAssetIds = sortDownloadIds(record.downloadAssetIds);
  }

  return records;
}

async function loadExistingResumeRecordsPg(client: pg.PoolClient) {
  const baseRows = await client.query<PgRow>(
    `
      SELECT id, title, slug, file_name, role, summary, featured_order, published
      FROM resume_records
    `,
  );
  const relRows = await client.query<PgRow>(
    `SELECT parent_id, "order", path, site_download_assets_id FROM resume_records_rels ORDER BY parent_id, "order", id`,
  );

  const records = new Map<string, ExistingPgResumeRecord>();
  const byId = new Map<number, SeedResumeRecord>();

  for (const row of baseRows.rows) {
    const slug = normalizeOptionalString(row.slug);
    const id = asNumber(row.id);
    const title = normalizeOptionalString(row.title);
    const fileName = normalizeOptionalString(row.file_name);
    const role = normalizeOptionalString(row.role);
    const summary = normalizeOptionalString(row.summary);

    if (!slug || id === null || !title || !fileName || !role || !summary) {
      continue;
    }

    const record: SeedResumeRecord = {
      title,
      slug,
      fileName,
      role,
      summary,
      featuredOrder: asNumber(row.featured_order) ?? 0,
      downloadAssetIds: [],
      published: asBoolean(row.published) ?? true,
    };

    records.set(slug, { id, record });
    byId.set(id, record);
  }

  for (const row of relRows.rows) {
    const parentId = asNumber(row.parent_id);
    const path = normalizeOptionalString(row.path);
    const siteDownloadAssetId = normalizeOptionalString(row.site_download_assets_id);
    if (parentId === null || path !== 'downloadAssets' || !siteDownloadAssetId) {
      continue;
    }

    const record = byId.get(parentId);
    if (!record) {
      continue;
    }

    record.downloadAssetIds.push(siteDownloadAssetId);
  }

  for (const { record } of records.values()) {
    record.downloadAssetIds = sortDownloadIds(record.downloadAssetIds);
  }

  return records;
}

function nestedId(slug: string, table: string, index: number) {
  return `${slug}--${table}--${index}`;
}

async function replaceProjectChildren(client: pg.PoolClient, parentId: number, record: SeedProjectRecord) {
  await client.query(`DELETE FROM project_records_tags WHERE _parent_id = $1`, [parentId]);
  await client.query(`DELETE FROM project_records_images WHERE _parent_id = $1`, [parentId]);
  await client.query(`DELETE FROM project_records_app_links WHERE _parent_id = $1`, [parentId]);
  await client.query(`DELETE FROM project_records_links WHERE _parent_id = $1`, [parentId]);
  await client.query(`DELETE FROM project_records_search_keywords WHERE _parent_id = $1`, [parentId]);
  await client.query(`DELETE FROM project_records_media WHERE _parent_id = $1`, [parentId]);
  await client.query(`DELETE FROM project_records_rels WHERE parent_id = $1`, [parentId]);

  for (const [index, tag] of record.tags.entries()) {
    await client.query(
      `INSERT INTO project_records_tags (_order, _parent_id, id, tag) VALUES ($1, $2, $3, $4)`,
      [index, parentId, nestedId(record.slug, 'tag', index), tag],
    );
  }

  for (const [index, image] of record.images.entries()) {
    await client.query(
      `INSERT INTO project_records_images (_order, _parent_id, id, image) VALUES ($1, $2, $3, $4)`,
      [index, parentId, nestedId(record.slug, 'image', index), image],
    );
  }

  for (const [index, link] of record.appLinks.entries()) {
    await client.query(
      `
        INSERT INTO project_records_app_links (_order, _parent_id, id, label, href, description, kind, external)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        index,
        parentId,
        nestedId(record.slug, 'app-link', index),
        link.label,
        link.href,
        link.description,
        link.kind,
        link.external,
      ],
    );
  }

  for (const [index, link] of record.links.entries()) {
    await client.query(
      `
        INSERT INTO project_records_links (_order, _parent_id, id, label, href, description, kind, external)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        index,
        parentId,
        nestedId(record.slug, 'link', index),
        link.label,
        link.href,
        link.description,
        link.kind,
        link.external,
      ],
    );
  }

  for (const [index, keyword] of record.searchKeywords.entries()) {
    await client.query(
      `INSERT INTO project_records_search_keywords (_order, _parent_id, id, keyword) VALUES ($1, $2, $3, $4)`,
      [index, parentId, nestedId(record.slug, 'keyword', index), keyword],
    );
  }

  for (const [index, media] of record.media.entries()) {
    await client.query(
      `
        INSERT INTO project_records_media (_order, _parent_id, id, type, src, url, title, thumbnail)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        index,
        parentId,
        nestedId(record.slug, 'media', index),
        media.type,
        media.src,
        media.url,
        media.title,
        media.thumbnail,
      ],
    );
  }

  for (const [index, assetId] of record.downloadAssetIds.entries()) {
    await client.query(
      `
        INSERT INTO project_records_rels ("order", parent_id, path, site_download_assets_id)
        VALUES ($1, $2, $3, $4)
      `,
      [index, parentId, 'downloadAssets', Number(assetId)],
    );
  }
}

async function replaceResumeChildren(client: pg.PoolClient, parentId: number, record: SeedResumeRecord) {
  await client.query(`DELETE FROM resume_records_rels WHERE parent_id = $1`, [parentId]);

  for (const [index, assetId] of record.downloadAssetIds.entries()) {
    await client.query(
      `
        INSERT INTO resume_records_rels ("order", parent_id, path, site_download_assets_id)
        VALUES ($1, $2, $3, $4)
      `,
      [index, parentId, 'downloadAssets', Number(assetId)],
    );
  }
}

async function syncProjectRecordsViaPostgres(projects: ProjectSourceRecord[]): Promise<SeedSummary> {
  const pool = new pg.Pool({ connectionString: getPayloadDatabaseUrl(), max: 4 });
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const existingRecords = await loadExistingProjectRecordsPg(client);
    const assetIdsBySlug = await loadScopedAssetIds(client, 'project');

    const summary: SeedSummary = { created: 0, updated: 0, skipped: 0 };
    await client.query('BEGIN');
    transactionStarted = true;

    for (const project of projects) {
      const desired = toSeedProjectRecord(project, assetIdsBySlug.get(project.slug) ?? []);
      const existing = existingRecords.get(project.slug);

      if (existing && projectSeedFingerprint(existing.record) === projectSeedFingerprint(desired)) {
        summary.skipped += 1;
        continue;
      }

      const result = await client.query<PgRow>(
        `
          INSERT INTO project_records (
            title,
            slug,
            description,
            date,
            updated,
            status,
            featured,
            featured_order,
            featured_image,
            github_url,
            live_url,
            app_url,
            app_label,
            published
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            date = EXCLUDED.date,
            updated = EXCLUDED.updated,
            status = EXCLUDED.status,
            featured = EXCLUDED.featured,
            featured_order = EXCLUDED.featured_order,
            featured_image = EXCLUDED.featured_image,
            github_url = EXCLUDED.github_url,
            live_url = EXCLUDED.live_url,
            app_url = EXCLUDED.app_url,
            app_label = EXCLUDED.app_label,
            published = EXCLUDED.published,
            updated_at = now()
          RETURNING id
        `,
        [
          desired.title,
          desired.slug,
          desired.description,
          desired.date,
          desired.updated,
          desired.status,
          desired.featured,
          desired.featuredOrder,
          desired.featuredImage,
          desired.githubUrl,
          desired.liveUrl,
          desired.appUrl,
          desired.appLabel,
          desired.published,
        ],
      );

      const parentId = asNumber(result.rows[0]?.id);
      if (parentId === null) {
        throw new Error(`project seed upsert missing id for ${project.slug}`);
      }

      await replaceProjectChildren(client, parentId, desired);

      if (existing) {
        summary.updated += 1;
      } else {
        summary.created += 1;
      }
    }

    await client.query('COMMIT');
    transactionStarted = false;
    return summary;
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK');
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function syncResumeRecordsViaPostgres(resumes: ResumeSourceRecord[]): Promise<SeedSummary> {
  const pool = new pg.Pool({ connectionString: getPayloadDatabaseUrl(), max: 4 });
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const existingRecords = await loadExistingResumeRecordsPg(client);
    const assetIdsBySlug = await loadScopedAssetIds(client, 'resume');

    const summary: SeedSummary = { created: 0, updated: 0, skipped: 0 };
    await client.query('BEGIN');
    transactionStarted = true;

    for (const resume of resumes) {
      const desired = toSeedResumeRecord(resume, assetIdsBySlug.get(resume.slug) ?? []);
      const existing = existingRecords.get(resume.slug);

      if (existing && resumeSeedFingerprint(existing.record) === resumeSeedFingerprint(desired)) {
        summary.skipped += 1;
        continue;
      }

      const result = await client.query<PgRow>(
        `
          INSERT INTO resume_records (
            title,
            slug,
            file_name,
            role,
            summary,
            featured_order,
            published
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (slug) DO UPDATE SET
            title = EXCLUDED.title,
            file_name = EXCLUDED.file_name,
            role = EXCLUDED.role,
            summary = EXCLUDED.summary,
            featured_order = EXCLUDED.featured_order,
            published = EXCLUDED.published,
            updated_at = now()
          RETURNING id
        `,
        [
          desired.title,
          desired.slug,
          desired.fileName,
          desired.role,
          desired.summary,
          desired.featuredOrder,
          desired.published,
        ],
      );

      const parentId = asNumber(result.rows[0]?.id);
      if (parentId === null) {
        throw new Error(`resume seed upsert missing id for ${resume.slug}`);
      }

      await replaceResumeChildren(client, parentId, desired);

      if (existing) {
        summary.updated += 1;
      } else {
        summary.created += 1;
      }
    }

    await client.query('COMMIT');
    transactionStarted = false;
    return summary;
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK');
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function syncProjectRecordsViaPayload(projects: ProjectSourceRecord[]): Promise<SeedSummary> {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: 'project-records',
    depth: 0,
    limit: 200,
    pagination: false,
  });

  const existingBySlug = new Map(
    existing.docs
      .map((doc) => {
        const record = toSeedProjectRecordFromPayloadDoc(doc, false);
        if (!record || !isRecord(doc)) {
          return null;
        }

        const id = asString(doc.id);
        return id ? [record.slug, { id, record }] : null;
      })
      .filter((entry): entry is [string, { id: string; record: SeedProjectRecord }] => entry !== null),
  );

  const summary: SeedSummary = { created: 0, updated: 0, skipped: 0 };

  for (const project of projects) {
    const desired = toSeedProjectRecord(project);
    const existingRecord = existingBySlug.get(project.slug);

    if (existingRecord && projectSeedFingerprint(existingRecord.record) === projectSeedFingerprint(desired)) {
      summary.skipped += 1;
      continue;
    }

    if (existingRecord) {
      await payload.update({
        collection: 'project-records',
        id: existingRecord.id,
        data: createProjectPayloadData(desired),
      });
      summary.updated += 1;
      continue;
    }

    await payload.create({
      collection: 'project-records',
      data: createProjectPayloadData(desired),
    });
    summary.created += 1;
  }

  return summary;
}

async function syncResumeRecordsViaPayload(resumes: ResumeSourceRecord[]): Promise<SeedSummary> {
  const payload = await getPayloadClient();
  const existing = await payload.find({
    collection: 'resume-records',
    depth: 0,
    limit: 200,
    pagination: false,
  });

  const existingBySlug = new Map(
    existing.docs
      .map((doc) => {
        const record = toSeedResumeRecordFromPayloadDoc(doc, false);
        if (!record || !isRecord(doc)) {
          return null;
        }

        const id = asString(doc.id);
        return id ? [record.slug, { id, record }] : null;
      })
      .filter((entry): entry is [string, { id: string; record: SeedResumeRecord }] => entry !== null),
  );

  const summary: SeedSummary = { created: 0, updated: 0, skipped: 0 };

  for (const resume of resumes) {
    const desired = toSeedResumeRecord(resume);
    const existingRecord = existingBySlug.get(resume.slug);

    if (existingRecord && resumeSeedFingerprint(existingRecord.record) === resumeSeedFingerprint(desired)) {
      summary.skipped += 1;
      continue;
    }

    if (existingRecord) {
      await payload.update({
        collection: 'resume-records',
        id: existingRecord.id,
        data: createResumePayloadData(desired),
      });
      summary.updated += 1;
      continue;
    }

    await payload.create({
      collection: 'resume-records',
      data: createResumePayloadData(desired),
    });
    summary.created += 1;
  }

  return summary;
}

export async function syncProjectRecordsSeed(projects: ProjectSourceRecord[]) {
  if (isPayloadUsingPostgres()) {
    return syncProjectRecordsViaPostgres(projects);
  }

  return syncProjectRecordsViaPayload(projects);
}

export async function syncResumeRecordsSeed(resumes: ResumeSourceRecord[]) {
  if (isPayloadUsingPostgres()) {
    return syncResumeRecordsViaPostgres(resumes);
  }

  return syncResumeRecordsViaPayload(resumes);
}
