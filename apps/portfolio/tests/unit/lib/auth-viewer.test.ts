import {
  AUTH_ENTITLEMENTS,
  getAuthTokenCookieName,
  getOwnerSeedConfig,
  isLocalAutoLoginEnabled,
  OWNER_DEFAULT_ENTITLEMENTS,
} from '@/lib/auth/config';
import { hasEntitlement, viewerFromUser } from '@/lib/auth/viewer';

describe('auth config and viewer helpers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('builds the expected auth cookie name', () => {
    expect(getAuthTokenCookieName()).toBe('portfolio-token');
  });

  it('uses local auto-login in development by default', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.PORTFOLIO_LOCAL_AUTOLOGIN;

    expect(isLocalAutoLoginEnabled()).toBe(true);
  });

  it('can disable local auto-login explicitly', () => {
    process.env.NODE_ENV = 'development';
    process.env.PORTFOLIO_LOCAL_AUTOLOGIN = 'false';

    expect(isLocalAutoLoginEnabled()).toBe(false);
  });

  it('maps an authenticated owner into a viewer contract', () => {
    const viewer = viewerFromUser(
      {
        id: 'user_1',
        email: 'owner@magicborn.local',
        displayName: 'Ben Garrard',
        avatarUrl: '/images/my_avatar.jpeg',
        role: 'owner',
        entitlements: OWNER_DEFAULT_ENTITLEMENTS,
        tenant: {
          id: 'tenant_1',
          slug: 'magicborn-studios',
          name: 'Magicborn Studios',
        },
      },
      true,
    );

    expect(viewer.authenticated).toBe(true);
    expect(viewer.autoLoggedIn).toBe(true);
    expect(viewer.user).toEqual(
      expect.objectContaining({
        email: 'owner@magicborn.local',
        avatarUrl: '/images/my_avatar.jpeg',
        canPersistReader: true,
        canEditReader: true,
        canUploadReaderAssets: true,
        canViewPrivateListen: true,
        canAccessAdmin: true,
      }),
    );
  });

  it('reports anonymous viewers when no user exists', () => {
    expect(viewerFromUser(null)).toEqual({
      authenticated: false,
      autoLoggedIn: false,
      user: null,
    });
  });

  it('checks entitlements safely', () => {
    expect(
      hasEntitlement([AUTH_ENTITLEMENTS.readerSync], AUTH_ENTITLEMENTS.readerSync),
    ).toBe(true);
    expect(
      hasEntitlement([AUTH_ENTITLEMENTS.readerSync], AUTH_ENTITLEMENTS.readerEdit),
    ).toBe(false);
  });

  it('derives owner seed config from env when present', () => {
    process.env.PORTFOLIO_OWNER_EMAIL = 'custom@example.com';
    process.env.PORTFOLIO_OWNER_PASSWORD = 'password-123';
    process.env.PORTFOLIO_OWNER_NAME = 'Custom Owner';
    process.env.PORTFOLIO_OWNER_TENANT_NAME = 'Custom Tenant';
    process.env.PORTFOLIO_OWNER_TENANT_SLUG = 'custom-tenant';
    process.env.PORTFOLIO_OWNER_AVATAR_URL = '/images/custom-owner.png';

    expect(getOwnerSeedConfig()).toEqual({
      email: 'custom@example.com',
      password: 'password-123',
      displayName: 'Custom Owner',
      tenantName: 'Custom Tenant',
      tenantSlug: 'custom-tenant',
      avatarUrl: '/images/custom-owner.png',
    });
  });
});
