import { POST as LOGIN_POST } from '@/app/api/auth/login/route';
import { POST as LOGOUT_POST } from '@/app/api/auth/logout/route';
import { GET as SESSION_GET } from '@/app/api/auth/session/route';
import { clearAuthCookie } from '@/lib/auth/cookies';
import { runAuthWorker } from '@/lib/auth/worker-runner';

vi.mock('@/lib/auth/cookies', () => ({
  clearAuthCookie: vi.fn(),
}));

vi.mock('@/lib/auth/worker-runner', () => ({
  runAuthWorker: vi.fn(),
}));

describe('/api/auth routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns auto-login response from the session route when available', async () => {
    vi.mocked(runAuthWorker).mockResolvedValue({
      status: 200,
      body: { ok: true },
      setCookie: 'portfolio-token=test; Path=/; HttpOnly',
    });

    const response = await SESSION_GET(new Request('http://localhost/api/auth/session'));

    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('portfolio-token=');
  });

  it('returns feature access for the current viewer when no auto-login occurs', async () => {
    vi.mocked(runAuthWorker).mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        session: {
          authenticated: true,
          autoLoggedIn: false,
          isOwner: false,
          role: null,
          tenant: null,
          entitlements: [],
          features: {
            reader: { persist: false, edit: false, upload: false },
            listen: { privateAccess: false },
            admin: { access: false },
          },
        },
      },
    });

    const response = await SESSION_GET(new Request('http://localhost/api/auth/session'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      session: expect.any(Object),
    });
    expect(runAuthWorker).toHaveBeenCalledWith('session', {
      cookieHeader: '',
    });
  });

  it('validates login payloads', async () => {
    const response = await LOGIN_POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '', password: '' }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it('delegates valid login requests to the auth session helper', async () => {
    vi.mocked(runAuthWorker).mockResolvedValue({
      status: 200,
      body: { ok: true },
      setCookie: 'portfolio-token=test; Path=/; HttpOnly',
    });

    const response = await LOGIN_POST(
      new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'owner@magicborn.local',
          password: 'magicborn-owner-local',
        }),
      }),
    );

    expect(runAuthWorker).toHaveBeenCalledWith('login', {
      email: 'owner@magicborn.local',
      password: 'magicborn-owner-local',
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('set-cookie')).toContain('portfolio-token=');
  });

  it('clears the auth cookie on logout', async () => {
    const response = await LOGOUT_POST();

    expect(response.status).toBe(200);
    expect(clearAuthCookie).toHaveBeenCalledWith(response);
  });
});
