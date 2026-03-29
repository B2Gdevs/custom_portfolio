import { requireBasicAdminAuth } from '@/lib/rag/basic-auth';

function makeRequest(authHeader?: string) {
  return new Request('http://localhost/api/admin/rag/ingest', {
    headers: authHeader ? { authorization: authHeader } : undefined,
  });
}

describe('requireBasicAdminAuth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ADMIN_BASIC_AUTH_USER;
    delete process.env.ADMIN_BASIC_AUTH_PASSWORD;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns 503 when credentials are not configured', async () => {
    const response = requireBasicAdminAuth(makeRequest());

    expect(response).not.toBeNull();
    expect(response?.status).toBe(503);
    await expect(response?.json()).resolves.toMatchObject({
      error: 'basic_auth_unconfigured',
    });
  });

  it('returns 401 when the authorization header is missing', () => {
    process.env.ADMIN_BASIC_AUTH_USER = 'admin';
    process.env.ADMIN_BASIC_AUTH_PASSWORD = 'secret';

    const response = requireBasicAdminAuth(makeRequest());

    expect(response?.status).toBe(401);
    expect(response?.headers.get('WWW-Authenticate')).toContain('Basic');
  });

  it('returns 401 when the credentials are invalid', () => {
    process.env.ADMIN_BASIC_AUTH_USER = 'admin';
    process.env.ADMIN_BASIC_AUTH_PASSWORD = 'secret';

    const invalidHeader = `Basic ${Buffer.from('admin:wrong').toString('base64')}`;
    const response = requireBasicAdminAuth(makeRequest(invalidHeader));

    expect(response?.status).toBe(401);
  });

  it('returns null when the credentials are valid', () => {
    process.env.ADMIN_BASIC_AUTH_USER = 'admin';
    process.env.ADMIN_BASIC_AUTH_PASSWORD = 'secret';

    const validHeader = `Basic ${Buffer.from('admin:secret').toString('base64')}`;
    const response = requireBasicAdminAuth(makeRequest(validHeader));

    expect(response).toBeNull();
  });
});
