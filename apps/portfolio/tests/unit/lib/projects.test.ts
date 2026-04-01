import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getProjectBySlug, getProjectEntries } from '@/lib/projects';
import { getAllContentEntries, getContentBySlug } from '@/lib/content';
import { runProjectRecordsWorker } from '@/lib/project-records-worker-runner';

vi.mock('@/lib/content', () => ({
  getAllContentEntries: vi.fn(),
  getContentBySlug: vi.fn(),
}));

vi.mock('@/lib/project-records-worker-runner', () => ({
  runProjectRecordsWorker: vi.fn(),
}));

const baseProjectEntry = {
  meta: {
    title: 'Dialogue Forge: Interactive Narrative Builder',
    slug: 'dialogue-forge-interactive-narrative-builder',
    description: 'Repo-authored description.',
    date: '2024-12-18',
    updated: '2024-12-18',
    tags: ['Interactive Fiction'],
    status: 'active',
    featured: true,
    featuredOrder: 3,
    appUrl: '/apps/dialogue-forge',
    appLabel: 'Open Dialogue Forge',
    appLinks: [],
    downloads: [],
    links: [],
    searchKeywords: ['branching dialogue'],
    media: [],
    images: ['/images/projects/dialogue-forge/featured.svg'],
    featuredImage: '/images/projects/dialogue-forge/featured.svg',
  },
  slug: 'dialogue-forge-interactive-narrative-builder',
  href: '/projects/dialogue-forge-interactive-narrative-builder',
  content: '## Overview',
  plainText: 'Dialogue Forge body.',
  headings: [{ id: 'overview', text: 'Overview', level: 2 }],
  missingRequiredSections: [],
};

describe('project records loader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getAllContentEntries).mockReturnValue([baseProjectEntry]);
    vi.mocked(getContentBySlug).mockReturnValue(baseProjectEntry);
  });

  it('falls back to repo-authored project frontmatter when Payload is unavailable', async () => {
    vi.mocked(runProjectRecordsWorker).mockRejectedValue(new Error('payload offline'));

    await expect(getProjectEntries()).resolves.toEqual([baseProjectEntry]);
  });

  it('merges project-record metadata over repo-authored project bodies', async () => {
    vi.mocked(runProjectRecordsWorker).mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        projects: [
          {
            slug: 'dialogue-forge-interactive-narrative-builder',
            title: 'Dialogue Forge',
            description: 'Payload-backed description.',
            featuredOrder: 1,
            status: 'production',
            downloadAssets: [
              {
                id: 'asset-1',
                title: 'Dialogue Forge PDF',
                downloadSlug: 'dialogue-forge-pdf',
                downloadKind: 'document',
                contentScope: 'project',
                contentSlug: 'dialogue-forge-interactive-narrative-builder',
                isCurrent: true,
                checksumSha256: 'abc',
                fileSizeBytes: 123,
                filename: 'dialogue-forge.pdf',
                summary: 'Printable overview.',
              },
            ],
          },
        ],
      },
    });

    await expect(getProjectBySlug('dialogue-forge-interactive-narrative-builder')).resolves.toEqual(
      expect.objectContaining({
        meta: expect.objectContaining({
          title: 'Dialogue Forge',
          description: 'Payload-backed description.',
          featuredOrder: 1,
          status: 'production',
          downloads: [
            expect.objectContaining({
              href: '/api/site-download-assets/file/dialogue-forge.pdf',
              label: 'Dialogue Forge PDF',
            }),
          ],
        }),
      }),
    );
  });
});
