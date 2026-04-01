import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getResumeBySlug, getResumes } from '@/lib/resumes';
import { runResumeRecordsWorker } from '@/lib/resume-records-worker-runner';

vi.mock('@/lib/resume-records-worker-runner', () => ({
  runResumeRecordsWorker: vi.fn(),
}));

describe('resume records loader', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('falls back to the repo-authored metadata when Payload is unavailable', async () => {
    vi.mocked(runResumeRecordsWorker).mockRejectedValue(new Error('payload offline'));

    await expect(getResumes()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: 'blitzpanel-founding-engineer',
          fileName: 'blitzpanel_resume.html',
        }),
      ]),
    );
  });

  it('uses resume-record rows when they exist', async () => {
    vi.mocked(runResumeRecordsWorker).mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        resumes: [
          {
            slug: 'custom-role',
            fileName: 'custom-role.html',
            title: 'Custom Resume',
            role: 'Staff engineer and systems builder',
            summary: 'Stored in Payload.',
            featuredOrder: 7,
          },
        ],
      },
    });

    await expect(getResumeBySlug('custom-role')).resolves.toEqual(
      expect.objectContaining({
        title: 'Custom Resume',
        fileName: 'custom-role.html',
      }),
    );
  });
});
