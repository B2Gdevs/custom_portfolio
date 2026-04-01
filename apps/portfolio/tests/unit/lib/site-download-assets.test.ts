import type { PlanningPackManifest } from '@/lib/planning-pack-manifest';
import { applyPlanningPackAssetUrls } from '@/lib/planning-pack-assets';
import {
  pickResumeHtmlAsset,
  resolveSiteDownloadAssetUrl,
  toSiteDownloadLinks,
  type SiteDownloadAssetRecord,
} from '@/lib/site-download-assets';

describe('site download assets helpers', () => {
  it('rewrites planning-pack manifest file URLs when current assets exist', () => {
    const manifest: PlanningPackManifest = {
      version: 1,
      generatedAt: '2026-03-31T00:00:00.000Z',
      demo: [
        {
          id: 'demo-1',
          title: 'Example state',
          file: '/planning-pack/demo/EXAMPLE-state.md',
          filename: 'EXAMPLE-state.md',
          section: 'demo',
          sectionLabel: 'Starter template',
          slug: 'demo/example-state',
        },
      ],
      site: [
        {
          id: 'global-state',
          title: 'State',
          file: '/planning-pack/site/global/planning/state.md',
          filename: 'state.md',
          section: 'global',
          sectionLabel: 'Global',
          slug: 'global/planning/state',
        },
      ],
    };

    const assets: SiteDownloadAssetRecord[] = [
      {
        id: 'asset-1',
        title: 'State',
        downloadSlug: 'planning-pack--global-state',
        downloadKind: 'planning-pack',
        contentScope: 'site',
        contentSlug: 'planning-pack',
        isCurrent: true,
        checksumSha256: 'abc',
        fileSizeBytes: 123,
        sourcePath: '/planning-pack/site/global/planning/state.md',
        filename: 'state-storage.md',
      },
    ];

    const rewritten = applyPlanningPackAssetUrls(manifest, assets);

    expect(rewritten.demo[0]?.file).toBe('/planning-pack/demo/EXAMPLE-state.md');
    expect(rewritten.site[0]?.file).toBe('/api/site-download-assets/file/state-storage.md');
  });

  it('picks the current html resume asset ahead of other files', () => {
    const assets: SiteDownloadAssetRecord[] = [
      {
        id: 'asset-pdf',
        title: 'Resume PDF',
        downloadSlug: 'resume--axiom--pdf',
        downloadKind: 'resume',
        contentScope: 'resume',
        contentSlug: 'axiom',
        isCurrent: true,
        checksumSha256: 'pdf',
        fileSizeBytes: 10,
        filename: 'axiom.pdf',
        mimeType: 'application/pdf',
      },
      {
        id: 'asset-html',
        title: 'Resume HTML',
        downloadSlug: 'resume--axiom--html',
        downloadKind: 'resume',
        contentScope: 'resume',
        contentSlug: 'axiom',
        isCurrent: true,
        checksumSha256: 'html',
        fileSizeBytes: 11,
        filename: 'axiom.html',
        mimeType: 'text/html',
      },
    ];

    expect(pickResumeHtmlAsset(assets)?.filename).toBe('axiom.html');
    expect(resolveSiteDownloadAssetUrl(assets[1])).toBe('/api/site-download-assets/file/axiom.html');
  });

  it('normalizes app and project download assets into content links', () => {
    const links = toSiteDownloadLinks([
      {
        id: 'asset-zip',
        title: 'Planning pack bundle',
        downloadSlug: 'app--planning-pack--site-bundle',
        downloadKind: 'app-bundle',
        contentScope: 'app',
        contentSlug: 'planning-pack',
        downloadLabel: 'Download site planning pack bundle',
        summary: 'ZIP bundle.',
        isCurrent: true,
        checksumSha256: 'zip',
        fileSizeBytes: 20,
        filename: 'planning-pack-site.zip',
      },
      {
        id: 'asset-doc',
        title: 'Dialogue Forge case study',
        downloadSlug: 'project--dialogue-forge--case-study',
        downloadKind: 'document',
        contentScope: 'project',
        contentSlug: 'dialogue-forge',
        isCurrent: true,
        checksumSha256: 'doc',
        fileSizeBytes: 30,
        filename: 'dialogue-forge.mdx',
      },
    ]);

    expect(links).toEqual([
      expect.objectContaining({
        href: '/api/site-download-assets/file/planning-pack-site.zip',
        label: 'Download site planning pack bundle',
      }),
      expect.objectContaining({
        href: '/api/site-download-assets/file/dialogue-forge.mdx',
        label: 'Dialogue Forge case study',
      }),
    ]);
  });
});
