import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_SITE_APPS, getSiteApps } from '@/lib/site-apps';
import { runSiteAppsWorker } from '@/lib/site-apps-worker-runner';

vi.mock('@/lib/site-apps-worker-runner', () => ({
  runSiteAppsWorker: vi.fn(),
}));

describe('site app records bootstrap', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('falls back to the file-authored app registry when Payload is unavailable', async () => {
    vi.mocked(runSiteAppsWorker).mockRejectedValue(new Error('payload offline'));

    await expect(getSiteApps()).resolves.toEqual(FALLBACK_SITE_APPS);
    expect(FALLBACK_SITE_APPS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'grime-time',
          href: 'https://grimetime.app',
          cta: 'Visit Grime Time',
        }),
        expect.objectContaining({
          id: 'get-anything-done',
          href: 'https://get-anything-done.vercel.app/',
          cta: 'Open GAD on Vercel',
        }),
        expect.objectContaining({
          id: 'repo-planner',
          href: 'https://repo-planner.vercel.app/',
          cta: 'Open Repo Planner on Vercel',
        }),
      ]),
    );
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
      },
    });

    await expect(getSiteApps()).resolves.toEqual([
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
    ]);
  });
});
