import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSiteApps } from '@/lib/site-apps';
import { runSiteAppsWorker } from '@/lib/site-apps-worker-runner';

vi.mock('@/lib/site-apps-worker-runner', () => ({
  runSiteAppsWorker: vi.fn(),
}));

describe('site app records bootstrap', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns loadError when the worker throws', async () => {
    vi.mocked(runSiteAppsWorker).mockRejectedValue(new Error('payload offline'));

    await expect(getSiteApps()).resolves.toEqual({
      apps: [],
      loadError: 'payload offline',
    });
  });

  it('returns loadError when the worker body is not ok', async () => {
    vi.mocked(runSiteAppsWorker).mockResolvedValue({
      status: 200,
      body: {
        ok: false,
        apps: [],
        loadError: 'connect ECONNREFUSED',
      },
    });

    await expect(getSiteApps()).resolves.toEqual({
      apps: [],
      loadError: 'connect ECONNREFUSED',
    });
  });

  it('returns empty apps when CMS has no published rows (ok, empty array)', async () => {
    vi.mocked(runSiteAppsWorker).mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        apps: [],
        loadError: null,
      },
    });

    await expect(getSiteApps()).resolves.toEqual({
      apps: [],
      loadError: null,
    });
  });

  it('uses site-app-record rows when they exist', async () => {
    vi.mocked(runSiteAppsWorker).mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        apps: [
          {
            id: 'get-anything-done',
            title: 'Get Anything Done (GAD)',
            href: 'https://get-anything-done.vercel.app/',
            description: 'Live from Payload.',
            iconName: 'terminal',
            cta: 'Open GAD on Vercel',
            supportHref: '/docs/get-anything-done/planning/state',
            supportLabel: 'Planning state on this site',
            supportText: 'Read-only by default.',
            downloads: [
              {
                href: '/api/site-download-assets/file/get-anything-done.zip',
                label: 'Download GAD bundle',
                kind: 'download',
                external: false,
              },
            ],
            featuredOrder: 20,
          },
        ],
        loadError: null,
      },
    });

    await expect(getSiteApps()).resolves.toEqual({
      apps: [
        expect.objectContaining({
          id: 'get-anything-done',
          description: 'Live from Payload.',
          downloads: [
            expect.objectContaining({
              href: '/api/site-download-assets/file/get-anything-done.zip',
              label: 'Download GAD bundle',
            }),
          ],
        }),
      ],
      loadError: null,
    });
  });
});
