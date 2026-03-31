import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { loadScriptEnv } from './load-script-env';
import { getPayloadClient } from '@/lib/payload';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';
import { getResumes } from '@/lib/resumes';
import {
  getSiteDownloadAssetFileURL,
  SITE_DOWNLOAD_ASSET_COLLECTION_SLUG,
} from '@/lib/payload/collections/siteDownloadAssets';
import { readStaticPlanningPackManifest } from '@/lib/planning-pack-assets';

type PayloadDoc = Record<string, unknown>;

type SiteDownloadInput = {
  absolutePath: string;
  sourcePath: string;
  title: string;
  downloadSlug: string;
  downloadKind: 'planning-pack' | 'resume';
  contentScope: 'site' | 'resume';
  contentSlug: string;
  downloadLabel?: string;
  summary?: string;
};

const APP_ROOT = resolvePortfolioAppRoot();
const REPO_ROOT = path.resolve(APP_ROOT, '..', '..');
const PLANNING_PACK_ROOT = path.join(APP_ROOT, 'public', 'planning-pack');
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

function collectResumeInputs(): SiteDownloadInput[] {
  return getResumes()
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

async function markPreviousCurrentDocs(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  currentId: string,
  downloadSlug: string,
) {
  const existing = await payload.find({
    collection: SITE_DOWNLOAD_ASSET_COLLECTION_SLUG,
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          downloadSlug: {
            equals: downloadSlug,
          },
        },
        {
          isCurrent: {
            equals: true,
          },
        },
      ],
    },
  });

  for (const doc of existing.docs) {
    const id = asString(isRecord(doc) ? doc.id : null);
    if (!id || id === currentId) {
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
  }
}

async function publishSiteDownloadInput(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  input: SiteDownloadInput,
  sourceCommit: string,
) {
  const checksumSha256 = sha256File(input.absolutePath);
  const existing = await payload.find({
    collection: SITE_DOWNLOAD_ASSET_COLLECTION_SLUG,
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: {
      downloadSlug: {
        equals: input.downloadSlug,
      },
    },
  });

  const matchingDoc = existing.docs.find((doc) => isRecord(doc) && asString(doc.checksumSha256) === checksumSha256);
  let resolvedDoc: PayloadDoc;

  if (matchingDoc && isRecord(matchingDoc)) {
    const id = asString(matchingDoc.id);
    if (!id) {
      throw new Error(`site download doc missing id for ${input.downloadSlug}`);
    }

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
        fileSizeBytes: fileSizeBytes(input.absolutePath),
        sourceCommit,
        sourcePath: input.sourcePath,
        publishedAt: new Date().toISOString(),
      },
    })) as PayloadDoc;
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
          fileSizeBytes: fileSizeBytes(input.absolutePath),
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

  await markPreviousCurrentDocs(payload, currentId, input.downloadSlug);

  return {
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
  const inputs = [...collectPlanningPackInputs(), ...collectResumeInputs()];
  let published = 0;

  for (const input of inputs) {
    await publishSiteDownloadInput(payload, input, sourceCommit);
    published += 1;
  }

  console.log(`[site-download-assets:publish] published ${published} file(s)`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('[site-download-assets:publish] failed:', error);
    process.exit(1);
  });
