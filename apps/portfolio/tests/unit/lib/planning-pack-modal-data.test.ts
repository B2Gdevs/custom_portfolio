import type { BuiltinEmbedPacksPayload, PlanningPackManifest } from 'repo-planner/planning-pack';
import { mergePlanningPackManifestWithBuiltinPacks } from '@/lib/planning-pack-modal-data';

describe('planning pack modal data', () => {
  it('merges builtin embed packs into the demo gallery', () => {
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
          slug: 'example-state',
        },
      ],
      site: [],
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
      ],
    };

    const merged = mergePlanningPackManifestWithBuiltinPacks({
      manifest,
      builtinPayload,
      createObjectUrl: ({ filename }) => `blob:${filename}`,
    });

    expect(merged?.demo).toHaveLength(2);
    expect(merged?.demo[1]).toMatchObject({
      id: 'rp-builtin-init:.planning/STATE.xml',
      title: 'STATE',
      file: 'blob:STATE.xml',
      filename: 'STATE.xml',
      section: 'builtin/rp-builtin-init',
      sectionLabel: 'Init pack (.planning)',
    });
  });

  it('still returns builtin packs when the site manifest is unavailable', () => {
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
      ],
    };

    const merged = mergePlanningPackManifestWithBuiltinPacks({
      manifest: null,
      builtinPayload,
      createObjectUrl: ({ filename }) => `blob:${filename}`,
    });

    expect(merged?.demo).toHaveLength(1);
    expect(merged?.site).toEqual([]);
  });
});
