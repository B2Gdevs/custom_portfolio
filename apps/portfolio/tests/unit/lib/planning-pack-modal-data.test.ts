import type { BuiltinEmbedPacksPayload, PlanningPackManifest } from '@/lib/planning-pack-types';
import { buildPlanningPackGalleryTabs } from '@/lib/planning-pack-modal-data';

describe('planning pack modal data', () => {
  it('builds a starter-template tab from the init builtin pack and keeps site exports separate', () => {
    const manifest: PlanningPackManifest = {
      version: 1,
      generatedAt: '2026-03-31T00:00:00.000Z',
      demo: [
        {
          id: 'demo-1',
          title: 'Example state',
          file: '/planning-pack/demo/EXAMPLE-state.md',
          filename: 'EXAMPLE-state.md',
          sizeBytes: 123,
          section: 'demo',
          sectionLabel: 'Starter template',
          slug: 'example-state',
        },
      ],
      site: [
        {
          id: 'site-1',
          title: 'Global state',
          file: '/planning-pack/site/global/state.mdx',
          filename: 'state.mdx',
          archivePath: 'global/planning/state.md',
          sizeBytes: 456,
          section: 'global',
          sectionLabel: 'Global',
          slug: 'global-state',
        },
      ],
    };

    const builtinPayload: BuiltinEmbedPacksPayload = {
      v: 1,
      generatedAt: '2026-03-31T01:00:00.000Z',
      packs: [
        {
          id: 'rp-builtin-init',
          label: 'Init pack (.planning)',
          files: [
            {
              path: '.planning/STATE.xml',
              content: '<state />',
            },
          ],
        },
        {
          id: 'rp-builtin-docs',
          label: 'Extra docs pack',
          files: [
            {
              path: 'docs/getting-started.md',
              content: '# Getting started',
            },
          ],
        },
      ],
    };

    const tabs = buildPlanningPackGalleryTabs({
      manifest,
      builtinPayload,
      createObjectUrl: ({ filename }) => `blob:${filename}`,
    });

    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toMatchObject({
      id: 'starter-template',
      label: 'GAD starter template',
      mode: 'sections',
    });
    expect(tabs[0]?.items).toHaveLength(1);
    expect(tabs[0]?.items[0]).toMatchObject({
      id: 'rp-builtin-init:.planning/STATE.xml',
      file: 'blob:STATE.xml',
      archivePath: '.planning/STATE.xml',
      sizeBytes: 9,
      sectionLabel: 'Init pack (.planning)',
    });
    expect(tabs[1]).toMatchObject({
      id: 'site-planning-packs',
      label: 'Site Markdown exports',
      mode: 'collapsible-sections',
    });
    expect(tabs[1]?.items).toEqual(manifest.site);
  });

  it('falls back to manifest demo items when the init builtin pack is unavailable', () => {
    const manifest: PlanningPackManifest = {
      version: 1,
      generatedAt: '2026-03-31T00:00:00.000Z',
      demo: [
        {
          id: 'demo-1',
          title: 'Example state',
          file: '/planning-pack/demo/EXAMPLE-state.md',
          filename: 'EXAMPLE-state.md',
          archivePath: 'demo/EXAMPLE-state.md',
          sizeBytes: 123,
          section: 'demo',
          sectionLabel: 'Starter template',
          slug: 'example-state',
        },
      ],
      site: [],
    };

    const tabs = buildPlanningPackGalleryTabs({
      manifest,
      builtinPayload: null,
      createObjectUrl: ({ filename }) => `blob:${filename}`,
    });

    expect(tabs[0]?.items).toEqual(manifest.demo);
    expect(tabs[1]?.items).toEqual([]);
  });
});
