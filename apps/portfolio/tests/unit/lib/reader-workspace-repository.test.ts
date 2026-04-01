vi.mock('server-only', () => ({}));

import { getPayloadClient } from '@/lib/payload';
import { getReaderWorkspaceRepository } from '@/lib/reader/workspace-repository';

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}));

describe('reader workspace repository', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('loads settings and library records from Payload collections', async () => {
    const payload = {
      find: vi
        .fn()
        .mockResolvedValueOnce({
          docs: [
            {
              id: 'settings-1',
              defaultWorkspaceView: 'continue-reading',
              preferPagedReader: false,
              showProgressBadges: true,
            },
          ],
        })
        .mockResolvedValueOnce({
          docs: [
            {
              id: 'library-1',
              title: 'Uploaded EPUB',
              sourceKind: 'uploaded',
              visibility: 'private',
              sourceFileName: 'uploaded.epub',
              updatedAt: '2026-03-30T00:00:00.000Z',
            },
          ],
        }),
    };
    vi.mocked(getPayloadClient).mockResolvedValue(payload as never);

    const result = await getReaderWorkspaceRepository().getWorkspace({
      tenantId: 'tenant-1',
      userId: 'user-1',
    });

    expect(result).toEqual({
      settings: {
        defaultWorkspaceView: 'continue-reading',
        preferPagedReader: false,
        showProgressBadges: true,
      },
      libraryRecords: [
        {
          id: 'library-1',
          title: 'Uploaded EPUB',
          bookSlug: null,
          author: null,
          description: null,
          coverImageUrl: null,
          epubUrl: null,
          sourceKind: 'uploaded',
          sourceFileName: 'uploaded.epub',
          visibility: 'private',
          updatedAt: '2026-03-30T00:00:00.000Z',
        },
      ],
    });

    expect(payload.find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'reader-settings',
      }),
    );
    expect(payload.find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'reader-library-records',
      }),
    );
  });
});
