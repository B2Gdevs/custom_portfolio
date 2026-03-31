import {
  AUTH_ENTITLEMENTS,
  type AuthEntitlement,
} from './config';

export type AuthViewer = {
  authenticated: boolean;
  autoLoggedIn: boolean;
  user: null | {
    id: string;
    email: string;
    displayName: string | null;
    role: string | null;
    tenant: null | {
      id: string | null;
      slug: string | null;
      name: string | null;
    };
    entitlements: AuthEntitlement[];
    canPersistReader: boolean;
    canEditReader: boolean;
    canUploadReaderAssets: boolean;
    canViewPrivateListen: boolean;
    canAccessAdmin: boolean;
  };
};

type UnknownRecord = Record<string, unknown>;

function asString(value: unknown) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function asStringArray(value: unknown): AuthEntitlement[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is AuthEntitlement => typeof entry === 'string');
}

export function hasEntitlement(
  entitlements: readonly string[] | null | undefined,
  entitlement: AuthEntitlement,
) {
  return Array.isArray(entitlements) && entitlements.includes(entitlement);
}

export function viewerFromUser(user: unknown, autoLoggedIn = false): AuthViewer {
  if (!user || typeof user !== 'object') {
    return {
      authenticated: false,
      autoLoggedIn: false,
      user: null,
    };
  }

  const record = user as UnknownRecord;
  const entitlements = asStringArray(record.entitlements);
  const tenantRecord =
    record.tenant && typeof record.tenant === 'object'
      ? (record.tenant as UnknownRecord)
      : null;

  return {
    authenticated: true,
    autoLoggedIn,
    user: {
      id: asString(record.id) || '',
      email: asString(record.email) || '',
      displayName: asString(record.displayName),
      role: asString(record.role),
      tenant: tenantRecord
        ? {
            id: asString(tenantRecord.id),
            slug: asString(tenantRecord.slug),
            name: asString(tenantRecord.name),
          }
        : null,
      entitlements,
      canPersistReader: hasEntitlement(entitlements, AUTH_ENTITLEMENTS.readerSync),
      canEditReader: hasEntitlement(entitlements, AUTH_ENTITLEMENTS.readerEdit),
      canUploadReaderAssets: hasEntitlement(
        entitlements,
        AUTH_ENTITLEMENTS.readerUpload,
      ),
      canViewPrivateListen: hasEntitlement(
        entitlements,
        AUTH_ENTITLEMENTS.listenPrivate,
      ),
      canAccessAdmin: hasEntitlement(entitlements, AUTH_ENTITLEMENTS.adminAccess),
    },
  };
}
