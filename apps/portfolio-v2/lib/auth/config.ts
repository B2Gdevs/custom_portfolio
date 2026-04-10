export const AUTH_COLLECTION_SLUG = 'users';
export const TENANT_COLLECTION_SLUG = 'tenants';
export const AUTH_COOKIE_PREFIX = 'portfolio';
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const AUTH_ENTITLEMENTS = {
  readerSync: 'reader:sync',
  readerEdit: 'reader:edit',
  readerUpload: 'reader:upload',
  listenPrivate: 'listen:private',
  adminAccess: 'admin:access',
} as const;

export type AuthEntitlement =
  (typeof AUTH_ENTITLEMENTS)[keyof typeof AUTH_ENTITLEMENTS];

export const OWNER_DEFAULT_ENTITLEMENTS: AuthEntitlement[] = [
  AUTH_ENTITLEMENTS.readerSync,
  AUTH_ENTITLEMENTS.readerEdit,
  AUTH_ENTITLEMENTS.readerUpload,
  AUTH_ENTITLEMENTS.listenPrivate,
  AUTH_ENTITLEMENTS.adminAccess,
];

export function getAuthTokenCookieName() {
  return `${AUTH_COOKIE_PREFIX}-token`;
}

export function getOwnerSeedConfig() {
  return {
    email:
      process.env.PORTFOLIO_OWNER_EMAIL?.trim() || 'owner@magicborn.local',
    password:
      process.env.PORTFOLIO_OWNER_PASSWORD?.trim() || 'magicborn-owner-local',
    displayName:
      process.env.PORTFOLIO_OWNER_NAME?.trim() || 'Ben Garrard',
    tenantName:
      process.env.PORTFOLIO_OWNER_TENANT_NAME?.trim() || 'Magicborn Studios',
    tenantSlug:
      process.env.PORTFOLIO_OWNER_TENANT_SLUG?.trim() || 'magicborn-studios',
    avatarUrl:
      process.env.PORTFOLIO_OWNER_AVATAR_URL?.trim() || '/images/my_avatar.jpeg',
  };
}

export function isLocalAutoLoginEnabled() {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.PORTFOLIO_LOCAL_AUTOLOGIN !== 'false'
  );
}
