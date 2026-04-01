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
            id: 'repo-planner',
            title: 'Repo Planner',
            href: '/apps/repo-planner',
            description: 'Live from Payload.',
            iconName: 'terminal',
            cta: 'Open Repo Planner',
            supportHref: '/docs/repo-planner/planning/planning-docs',
            supportLabel: 'Repo Planner docs',
            supportText: 'Read-only by default.',
            downloads: [
              {
                href: '/api/site-download-assets/file/repo-planner.zip',
                label: 'Download repo planner bundle',
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
        id: 'repo-planner',
        description: 'Live from Payload.',
        downloads: [
          expect.objectContaining({
            href: '/api/site-download-assets/file/repo-planner.zip',
            label: 'Download repo planner bundle',
          }),
        ],
      }),
    ]);
  });
});
