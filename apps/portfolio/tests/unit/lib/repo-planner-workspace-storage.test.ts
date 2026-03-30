// @vitest-environment jsdom

import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { readPreviewUploadAsPack } from 'repo-planner/workspace-storage';

describe('readPreviewUploadAsPack', () => {
  it('parses a planning zip as an ephemeral preview pack', async () => {
    const zip = new JSZip();
    zip.file('.planning/STATE.xml', '<state><current-phase>01</current-phase></state>');
    zip.file('.planning/TASK-REGISTRY.xml', '<task-registry></task-registry>');
    const blob = await zip.generateAsync({ type: 'blob' });
    const file = new File([blob], 'sample-planning.zip', { type: 'application/zip' });

    const pack = await readPreviewUploadAsPack([file]);

    expect(pack.name).toBe('sample-planning');
    expect(pack.files.map((entry) => entry.path)).toEqual(
      expect.arrayContaining(['.planning/STATE.xml', '.planning/TASK-REGISTRY.xml']),
    );
  });

  it('parses an exported planning-pack json payload', async () => {
    const file = new File(
      [
        JSON.stringify({
          id: 'saved-pack',
          name: 'Saved pack',
          createdAt: '2026-03-30T00:00:00.000Z',
          files: [{ path: 'ROADMAP.xml', content: '<roadmap />' }],
        }),
      ],
      'saved-pack.json',
      { type: 'application/json' },
    );

    const pack = await readPreviewUploadAsPack([file]);

    expect(pack.name).toBe('Saved pack');
    expect(pack.files).toEqual([{ path: 'ROADMAP.xml', content: '<roadmap />' }]);
  });
});
