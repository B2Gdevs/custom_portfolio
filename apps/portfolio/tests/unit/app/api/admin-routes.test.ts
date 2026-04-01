import { GET as BLOG_GET } from '@/app/api/admin/blog/route';
import { GET as ENV_GET } from '@/app/api/admin/env/route';
import { getAllContent } from '@/lib/content';
import {
  adminUnauthorizedResponse,
  isAdminOwnerRequest,
} from '@/lib/auth/admin-owner-gate';

vi.mock('@/lib/content', () => ({
  getAllContent: vi.fn(),
}));

vi.mock('@/lib/auth/admin-owner-gate', () => ({
  isAdminOwnerRequest: vi.fn(),
  adminUnauthorizedResponse: vi.fn(() =>
    Response.json(
      {
        ok: false,
        error: 'admin_access_required',
      },
      { status: 401 },
    ),
  ),
}));

describe('/api/admin routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the shared unauthorized response for admin content routes', async () => {
    vi.mocked(isAdminOwnerRequest).mockResolvedValue(false);

    const response = await BLOG_GET(new Request('http://localhost/api/admin/blog'));

    expect(adminUnauthorizedResponse).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });

  it('returns blog content for authorized owner requests', async () => {
    vi.mocked(isAdminOwnerRequest).mockResolvedValue(true);
    vi.mocked(getAllContent).mockReturnValue([
      {
        slug: 'post-1',
        meta: {
          title: 'Post 1',
        },
      },
    ]);

    const response = await BLOG_GET(new Request('http://localhost/api/admin/blog'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        slug: 'post-1',
        meta: {
          title: 'Post 1',
        },
      },
    ]);
  });

  it('keeps env inspection owner-gated before the development-only check', async () => {
    vi.mocked(isAdminOwnerRequest).mockResolvedValue(false);

    const response = await ENV_GET(new Request('http://localhost/api/admin/env'));

    expect(response.status).toBe(401);
  });
});
