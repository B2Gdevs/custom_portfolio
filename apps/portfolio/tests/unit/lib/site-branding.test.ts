import { describe, expect, it, vi, beforeEach } from 'vitest';

const find = vi.fn();

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(async () => ({
    find,
  })),
}));

describe('getActiveSiteLogoPublicUrl', () => {
  beforeEach(() => {
    find.mockReset();
  });

  it('returns null when Payload has no current brand logo', async () => {
    find.mockResolvedValueOnce({ docs: [] });
    const { getActiveSiteLogoPublicUrl } = await import('@/lib/site-branding');
    await expect(getActiveSiteLogoPublicUrl()).resolves.toBeNull();
  });

  it('returns file URL from filename when a current doc exists', async () => {
    find.mockResolvedValueOnce({
      docs: [{ filename: 'brand--logo--abc.png' }],
    });
    const { getActiveSiteLogoPublicUrl } = await import('@/lib/site-branding');
    await expect(getActiveSiteLogoPublicUrl()).resolves.toBe(
      '/api/site-media-assets/file/brand--logo--abc.png',
    );
  });
});
