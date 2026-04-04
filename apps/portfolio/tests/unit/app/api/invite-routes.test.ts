import { GET, POST } from '@/app/api/auth/invite/accept/route';
import {
  verifyInviteToken,
  acceptInvite,
  type InviteRecord,
} from '@/lib/auth/invite';
import { loginWithCredentials } from '@/lib/auth/session';
import { inviteExpiresAt, hashInviteToken } from '@/lib/auth/invite';

vi.mock('@/lib/auth/invite', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/auth/invite')>();
  return {
    ...original,
    verifyInviteToken: vi.fn(),
    acceptInvite: vi.fn(),
  };
});

vi.mock('@/lib/auth/session', () => ({
  loginWithCredentials: vi.fn(),
}));

function makeInviteRecord(overrides: Partial<InviteRecord> = {}): InviteRecord {
  return {
    id: 'rec-1',
    email: 'invited@example.com',
    role: 'member',
    tenant: { id: 'ten-1', slug: 'acme', name: 'Acme Corp' },
    tokenHash: hashInviteToken('tok123'),
    expiresAt: inviteExpiresAt().toISOString(),
    acceptedAt: null,
    revokedAt: null,
    ...overrides,
  };
}

describe('GET /api/auth/invite/accept', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 400 when no token is provided', async () => {
    const res = await GET(new Request('http://localhost/api/auth/invite/accept'));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ ok: false, error: 'missing_token' });
  });

  it('returns 400 with reason when token is invalid', async () => {
    vi.mocked(verifyInviteToken).mockResolvedValue({ valid: false, reason: 'not_found' });

    const res = await GET(
      new Request('http://localhost/api/auth/invite/accept?token=bad-token'),
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ ok: false, error: 'not_found' });
  });

  it('returns 400 for an expired token', async () => {
    vi.mocked(verifyInviteToken).mockResolvedValue({ valid: false, reason: 'expired' });

    const res = await GET(
      new Request('http://localhost/api/auth/invite/accept?token=expired'),
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ ok: false, error: 'expired' });
  });

  it('returns 400 for an already-used token', async () => {
    vi.mocked(verifyInviteToken).mockResolvedValue({ valid: false, reason: 'already_used' });

    const res = await GET(
      new Request('http://localhost/api/auth/invite/accept?token=used'),
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ ok: false, error: 'already_used' });
  });

  it('returns 400 for a revoked token', async () => {
    vi.mocked(verifyInviteToken).mockResolvedValue({ valid: false, reason: 'revoked' });

    const res = await GET(
      new Request('http://localhost/api/auth/invite/accept?token=revoked'),
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ ok: false, error: 'revoked' });
  });

  it('returns invite context for a valid token', async () => {
    const record = makeInviteRecord({ role: 'admin' });
    vi.mocked(verifyInviteToken).mockResolvedValue({ valid: true, record });

    const res = await GET(
      new Request('http://localhost/api/auth/invite/accept?token=tok123'),
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({
      ok: true,
      invite: {
        email: 'invited@example.com',
        role: 'admin',
        tenant: { name: 'Acme Corp', slug: 'acme' },
      },
    });
  });
});

describe('POST /api/auth/invite/accept', () => {
  // Each test uses a unique IP so the in-process rate limiter (5 req / IP / 15 min)
  // is never exhausted within the test suite.
  let ipCounter = 0;

  beforeEach(() => {
    vi.resetAllMocks();
    ipCounter += 1;
  });

  function makePostRequest(body: object) {
    return new Request('http://localhost/api/auth/invite/accept', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': `10.0.0.${ipCounter}`,
      },
      body: JSON.stringify(body),
    });
  }

  it('returns 400 when token is missing', async () => {
    const res = await POST(makePostRequest({ password: 'secret123' }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ ok: false, error: 'invalid_payload' });
  });

  it('returns 400 when password is missing', async () => {
    const res = await POST(makePostRequest({ token: 'tok' }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ ok: false, error: 'invalid_payload' });
  });

  it('returns 400 when password is too short', async () => {
    const res = await POST(makePostRequest({ token: 'tok123', password: 'short' }));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ ok: false, error: 'weak_password' });
  });

  it('returns 400 when acceptInvite reports an invalid token', async () => {
    vi.mocked(acceptInvite).mockResolvedValue({ ok: false, reason: 'expired' });

    const res = await POST(
      makePostRequest({ token: 'expired-tok', password: 'validpassword' }),
    );

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ ok: false, error: 'expired' });
  });

  it('calls loginWithCredentials and returns session on success', async () => {
    vi.mocked(acceptInvite).mockResolvedValue({
      ok: true,
      email: 'invited@example.com',
      role: 'member',
    });
    vi.mocked(loginWithCredentials).mockResolvedValue(
      Response.json({ ok: true, session: {} }, { status: 200 }) as never,
    );

    const res = await POST(
      makePostRequest({ token: 'good-tok', password: 'validpassword' }),
    );

    expect(acceptInvite).toHaveBeenCalledWith(
      expect.objectContaining({ plaintext: 'good-tok', password: 'validpassword' }),
    );
    expect(loginWithCredentials).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'invited@example.com' }),
    );
    expect(res.status).toBe(200);
  });

  it('returns 201 partial success if auto-login fails after account creation', async () => {
    vi.mocked(acceptInvite).mockResolvedValue({
      ok: true,
      email: 'invited@example.com',
      role: 'member',
    });
    vi.mocked(loginWithCredentials).mockRejectedValue(new Error('db timeout'));

    const res = await POST(
      makePostRequest({ token: 'good-tok', password: 'validpassword' }),
    );

    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toMatchObject({ ok: true, autoLogin: false });
  });
});
