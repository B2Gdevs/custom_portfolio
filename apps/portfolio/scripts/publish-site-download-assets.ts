import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import JSZip from 'jszip';
import { loadScriptEnv } from './load-script-env';
import { getContentBySlug, getContentFiles } from '@/lib/content';
import { getPayloadClient } from '@/lib/payload';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';
import {
  shouldUpdatePublishedSiteDownload,
  type SiteDownloadPublishComparable,
} from '@/lib/payload/site-download-publish';
import {
  getSiteDownloadAssetFileURL,
  SITE_DOWNLOAD_ASSET_COLLECTION_SLUG,
} from '@/lib/payload/collections/siteDownloadAssets';
import { getResumeSourceEntries } from '@/lib/resumes';
import { readStaticPlanningPackManifest } from '@/lib/planning-pack-assets';

type PayloadDoc = Record<string, unknown>;

type SiteDownloadKind = 'planning-pack' | 'resume' | 'app-bundle' | 'document' | 'archive' | 'other';
type SiteDownloadScope = 'site' | 'app' | 'project' | 'resume' | 'book';

type SiteDownloadInput = {
  absolutePath: string;
  sourcePath: string;
  title: string;
  downloadSlug: string;
  downloadKind: SiteDownloadKind;
  contentScope: SiteDownloadScope;
  contentSlug: string;
  downloadLabel?: string;
  summary?: string;
  cleanup?: () => void;
};

type PublishSummary = {
  created: number;
  updated: number;
  skipped: number;
};

const APP_ROOT = resolvePortfolioAppRoot();
const REPO_ROOT = path.resolve(APP_ROOT, '..', '..');
const PLANNING_PACK_ROOT = path.join(APP_ROOT, 'public', 'planning-pack');
const PROJECTS_CONTENT_ROOT = path.join(APP_ROOT, 'content', 'projects');
const ALLOWED_PLANNING_PACK_EXTENSIONS = new Set(['.json', '.md', '.txt', '.html', '.zip']);
function asString(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function isRecord(value: unknown): value is PayloadDoc {
  return Boolean(value) && typeof value === 'object';
}

function sha256File(filePath: string) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function fileSizeBytes(filePath: string) {
  return fs.statSync(filePath).size;
}

function getGitShortCommit() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'local';
  }
}

function sanitizeStem(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function buildStoredFilename(prefix: string, stem: string, checksumSha256: string, ext: string) {
  return `${prefix}--${sanitizeStem(stem)}--${checksumSha256.slice(0, 12)}${ext.toLowerCase()}`;
}

function createTempCopy(sourcePath: string, filename: string) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-site-downloads-'));
  const tempPath = path.join(tempDir, filename);
  fs.copyFileSync(sourcePath, tempPath);
  return {
    filePath: tempPath,
    cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true }),
  };
}

function walkFiles(rootPath: string): string[] {
  if (!fs.existsSync(rootPath)) {
    return [];
  }

  return fs.readdirSync(rootPath, { withFileTypes: true }).flatMap((entry): string[] => {
    const fullPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }

    return [fullPath];
  });
}

async function createDirectoryZipBundle(sourceDir: string, filename: string) {
  const zip = new JSZip();
  const files = walkFiles(sourceDir).sort((a, b) => a.localeCompare(b));

  for (const absolutePath of files) {
    const relativePath = path.relative(sourceDir, absolutePath).replace(/\\/g, '/');
    zip.file(relativePath, fs.readFileSync(absolutePath));
  }

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-site-downloads-bundle-'));
  const tempPath = path.join(tempDir, filename);
  fs.writeFileSync(tempPath, buffer);

  return {
    filePath: tempPath,
    cleanup: () => fs.rmSync(tempDir, { recursive: true, force: true }),
  };
}

function titleFromPlanningPackPath(filePath: string) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const manifest = readStaticPlanningPackManifest();
  const matchedEntry = [...manifest.demo, ...manifest.site].find((entry) => entry.file === normalizedPath);

  if (matchedEntry?.title) {
    return matchedEntry.title;
  }

  if (normalizedPath === '/planning-pack/manifest.json') {
    return 'Planning pack manifest';
  }

  return path.basename(normalizedPath, path.extname(normalizedPath));
}

function collectPlanningPackInputs(): SiteDownloadInput[] {
  return walkFiles(PLANNING_PACK_ROOT)
    .filter((absolutePath) => ALLOWED_PLANNING_PACK_EXTENSIONS.has(path.extname(absolutePath).toLowerCase()))
    .map((absolutePath) => {
      const relativePath = path.relative(PLANNING_PACK_ROOT, absolutePath).replace(/\\/g, '/');
      const publicPath = `/planning-pack/${relativePath}`;
      const stem = relativePath.replace(/\.[^.]+$/, '').replace(/\//g, '--');

      return {
        absolutePath,
        sourcePath: publicPath,
        title: titleFromPlanningPackPath(publicPath),
        downloadSlug: `planning-pack--${sanitizeStem(stem)}`,
        downloadKind: 'planning-pack' as const,
        contentScope: 'site' as const,
        contentSlug: 'planning-pack',
        downloadLabel: `Download ${titleFromPlanningPackPath(publicPath)}`,
        summary: 'Public planning-pack export published through site-download-assets.',
      };
    })
    .sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
}

async function collectPlanningPackBundleInputs(): Promise<SiteDownloadInput[]> {
  const inputs: SiteDownloadInput[] = [];
  const bundles = [
    {
      sourceDir: path.join(PLANNING_PACK_ROOT, 'site'),
      sourcePath: '/planning-pack/site',
      title: 'Planning pack site bundle',
      downloadSlug: 'app--planning-pack--site-bundle',
      downloadLabel: 'Download site planning pack bundle',
      summary: 'ZIP bundle of the published site planning-pack export.',
    },
    {
      sourceDir: path.join(PLANNING_PACK_ROOT, 'demo'),
      sourcePath: '/planning-pack/demo',
      title: 'Planning pack demo bundle',
      downloadSlug: 'app--planning-pack--demo-bundle',
      downloadLabel: 'Download demo planning pack bundle',
      summary: 'ZIP bundle of the starter planning-pack examples.',
    },
  ];

  for (const bundle of bundles) {
    if (!fs.existsSync(bundle.sourceDir)) {
      continue;
    }

    const prepared = await createDirectoryZipBundle(
      bundle.sourceDir,
      `${sanitizeStem(bundle.downloadSlug)}.zip`,
    );

    inputs.push({
      absolutePath: prepared.filePath,
      sourcePath: bundle.sourcePath,
      title: bundle.title,
      downloadSlug: bundle.downloadSlug,
      downloadKind: 'app-bundle',
      contentScope: 'app',
      contentSlug: 'planning-pack',
      downloadLabel: bundle.downloadLabel,
      summary: bundle.summary,
      cleanup: prepared.cleanup,
    });
  }

  return inputs;
}

function collectResumeInputs(): SiteDownloadInput[] {
  return getResumeSourceEntries()
    .map((resume) => ({
      absolutePath: resume.sourcePath,
      sourcePath: `misc/html_resumes/${resume.fileName}`,
      title: resume.title,
      downloadSlug: `resume--${resume.slug}--html`,
      downloadKind: 'resume' as const,
      contentScope: 'resume' as const,
      contentSlug: resume.slug,
      downloadLabel: `Download ${resume.title} HTML`,
      summary: resume.summary,
    }))
    .sort((a, b) => a.downloadSlug.localeCompare(b.downloadSlug));
}

function collectProjectDocumentInputs(): SiteDownloadInput[] {
  return getContentFiles('projects')
    .flatMap((relativePath) => {
      const slug = relativePath.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
      const project = getContentBySlug('projects', slug);
      if (!project) {
        return [];
      }

      const input: SiteDownloadInput = {
        absolutePath: path.join(PROJECTS_CONTENT_ROOT, relativePath),
        sourcePath: `content/projects/${relativePath.replace(/\\/g, '/')}`,
        title: `${project.meta.title} case study`,
        downloadSlug: `project--${slug}--case-study`,
        downloadKind: 'document',
        contentScope: 'project',
        contentSlug: slug,
        downloadLabel: 'Download case study source',
        summary: project.meta.description
          ? `${project.meta.description} Source document published through site-download-assets.`
          : 'Project case study source published through site-download-assets.',
      };
      return [input];
    })
    .sort((a, b) => a.downloadSlug.localeCompare(b.downloadSlug));
}

async function markPreviousCurrentDocs(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  existingDocsBySlug: Map<string, PayloadDoc[]>,
  currentId: string,
  downloadSlug: string,
) {
  const existingDocs = existingDocsBySlug.get(downloadSlug) ?? [];

  for (const doc of existingDocs) {
    const id = asString(isRecord(doc) ? doc.id : null);
    if (!id || id === currentId) {
      continue;
    }

    if (!isRecord(doc) || doc.isCurrent !== true) {
      continue;
    }

    await payload.update({
      collection: SITE_DOWNLOAD_ASSET_COLLECTION_SLUG,
      id,
      overrideAccess: true,
      depth: 0,
      data: {
        isCurrent: false,
      },
    });

    doc.isCurrent = false;
  }
}

function toPublishComparable(
  input: SiteDownloadInput,
  checksumSha256: string,
): SiteDownloadPublishComparable {
  return {
    title: input.title,
    downloadSlug: input.downloadSlug,
    downloadKind: input.downloadKind,
    contentScope: input.contentScope,
    contentSlug: input.contentSlug,
    downloadLabel: input.downloadLabel ?? null,
    summary: input.summary ?? null,
    checksumSha256,
    fileSizeBytes: fileSizeBytes(input.absolutePath),
    sourcePath: input.sourcePath,
    isCurrent: true,
  };
}

async function loadExistingSiteDownloads(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
) {
  const existing = await payload.find({
    collection: SITE_DOWNLOAD_ASSET_COLLECTION_SLUG,
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
  });

  const docsBySlug = new Map<string, PayloadDoc[]>();

  for (const doc of existing.docs) {
    if (!isRecord(doc)) {
      continue;
    }

    const downloadSlug = asString(doc.downloadSlug);
    if (!downloadSlug) {
      continue;
    }

    const docs = docsBySlug.get(downloadSlug) ?? [];
    docs.push(doc);
    docsBySlug.set(downloadSlug, docs);
  }

  return docsBySlug;
}

async function publishSiteDownloadInput(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  existingDocsBySlug: Map<string, PayloadDoc[]>,
  input: SiteDownloadInput,
  sourceCommit: string,
) {
  const checksumSha256 = sha256File(input.absolutePath);
  const existingDocs = existingDocsBySlug.get(input.downloadSlug) ?? [];
  const matchingDoc = existingDocs.find(
    (doc) => isRecord(doc) && asString(doc.checksumSha256) === checksumSha256,
  );
  let resolvedDoc: PayloadDoc;
  let action: keyof PublishSummary = 'created';
  const comparable = toPublishComparable(input, checksumSha256);

  if (matchingDoc && isRecord(matchingDoc)) {
    const id = asString(matchingDoc.id);
    if (!id) {
      throw new Error(`site download doc missing id for ${input.downloadSlug}`);
    }

    if (shouldUpdatePublishedSiteDownload(matchingDoc, comparable)) {
      resolvedDoc = (await payload.update({
        collection: SITE_DOWNLOAD_ASSET_COLLECTION_SLUG,
        id,
        overrideAccess: true,
        depth: 0,
        data: {
          title: input.title,
          downloadSlug: input.downloadSlug,
          downloadKind: input.downloadKind,
          contentScope: input.contentScope,
          contentSlug: input.contentSlug,
          downloadLabel: input.downloadLabel,
          summary: input.summary,
          isCurrent: true,
          fileSizeBytes: comparable.fileSizeBytes,
          sourceCommit,
          sourcePath: input.sourcePath,
          publishedAt: new Date().toISOString(),
        },
      })) as PayloadDoc;
      action = 'updated';
    } else {
      resolvedDoc = matchingDoc;
      action = 'skipped';
    }
  } else {
    const ext = path.extname(input.absolutePath);
    const tempCopy = createTempCopy(
      input.absolutePath,
      buildStoredFilename('site-download', input.downloadSlug, checksumSha256, ext),
    );

    try {
      resolvedDoc = (await payload.create({
        collection: SITE_DOWNLOAD_ASSET_COLLECTION_SLUG,
        overrideAccess: true,
        depth: 0,
        filePath: tempCopy.filePath,
        data: {
          title: input.title,
          downloadSlug: input.downloadSlug,
          downloadKind: input.downloadKind,
          contentScope: input.contentScope,
          contentSlug: input.contentSlug,
          downloadLabel: input.downloadLabel,
          summary: input.summary,
          isCurrent: true,
          checksumSha256,
          fileSizeBytes: comparable.fileSizeBytes,
          sourceCommit,
          sourcePath: input.sourcePath,
          publishedAt: new Date().toISOString(),
        },
      })) as PayloadDoc;
    } finally {
      tempCopy.cleanup();
    }
  }

  const currentId = asString(resolvedDoc.id);
  if (!currentId) {
    throw new Error(`site download publish missing id for ${input.downloadSlug}`);
  }

  const slugDocs = existingDocsBySlug.get(input.downloadSlug) ?? [];
  const existingIndex = slugDocs.findIndex((doc) => asString(doc.id) === currentId);
  if (existingIndex >= 0) {
    slugDocs[existingIndex] = resolvedDoc;
  } else {
    slugDocs.push(resolvedDoc);
  }
  existingDocsBySlug.set(input.downloadSlug, slugDocs);

  await markPreviousCurrentDocs(payload, existingDocsBySlug, currentId, input.downloadSlug);

  return {
    action,
    downloadSlug: input.downloadSlug,
    filename: asString(resolvedDoc.filename),
    url: asString(resolvedDoc.filename)
      ? getSiteDownloadAssetFileURL(asString(resolvedDoc.filename) ?? '')
      : asString(resolvedDoc.url),
  };
}

async function main() {
  loadScriptEnv();

  const payload = await getPayloadClient();
  const sourceCommit = getGitShortCommit();
  const existingDocsBySlug = await loadExistingSiteDownloads(payload);
  const inputs = [
    ...collectPlanningPackInputs(),
    ...(await collectPlanningPackBundleInputs()),
    ...collectResumeInputs(),
    ...collectProjectDocumentInputs(),
  ];
  const summary: PublishSummary = { created: 0, updated: 0, skipped: 0 };

  for (const input of inputs) {
    try {
      const result = await publishSiteDownloadInput(payload, existingDocsBySlug, input, sourceCommit);
      summary[result.action] += 1;
    } finally {
      input.cleanup?.();
    }
  }

  console.log(
    `[site-download-assets:publish] ${summary.created} created, ${summary.updated} updated, ${summary.skipped} skipped`,
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('[site-download-assets:publish] failed:', error);
    process.exit(1);
  });
