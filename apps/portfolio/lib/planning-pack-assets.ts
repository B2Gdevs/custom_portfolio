import fs from 'node:fs';
import path from 'node:path';
import type { PlanningPackManifest } from '@/lib/planning-pack-manifest';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';
import {
  findSiteDownloadAssets,
  resolveSiteDownloadAssetUrl,
  type SiteDownloadAssetRecord,
} from '@/lib/site-download-assets';

const APP_ROOT = resolvePortfolioAppRoot();
const STATIC_MANIFEST_PATH = path.join(APP_ROOT, 'public', 'planning-pack', 'manifest.json');

function emptyManifest(): PlanningPackManifest {
  return {
    version: 1,
    generatedAt: new Date(0).toISOString(),
    demo: [],
    site: [],
  };
}

export function readStaticPlanningPackManifest(): PlanningPackManifest {
  if (!fs.existsSync(STATIC_MANIFEST_PATH)) {
    return emptyManifest();
  }

  try {
    return JSON.parse(fs.readFileSync(STATIC_MANIFEST_PATH, 'utf8')) as PlanningPackManifest;
  } catch {
    return emptyManifest();
  }
}

export function applyPlanningPackAssetUrls(
  manifest: PlanningPackManifest,
  assets: SiteDownloadAssetRecord[],
): PlanningPackManifest {
  const assetUrlBySourcePath = new Map<string, string>();

  for (const asset of assets) {
    if (!asset.sourcePath) {
      continue;
    }

    const assetUrl = resolveSiteDownloadAssetUrl(asset);
    if (!assetUrl) {
      continue;
    }

    assetUrlBySourcePath.set(asset.sourcePath.replace(/\\/g, '/'), assetUrl);
  }

  const rewriteItem = <T extends { file: string }>(item: T): T => ({
    ...item,
    file: assetUrlBySourcePath.get(item.file.replace(/\\/g, '/')) ?? item.file,
  });

  return {
    ...manifest,
    demo: manifest.demo.map(rewriteItem),
    site: manifest.site.map(rewriteItem),
  };
}

export async function getPlanningPackManifest() {
  const manifest = readStaticPlanningPackManifest();
  const assets = await findSiteDownloadAssets({
    downloadKind: 'planning-pack',
    contentScope: 'site',
    contentSlug: 'planning-pack',
  });

  if (assets.length === 0) {
    return manifest;
  }

  return applyPlanningPackAssetUrls(manifest, assets);
}
