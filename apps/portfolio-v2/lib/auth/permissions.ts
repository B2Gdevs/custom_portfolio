import type { AuthViewer } from './viewer';

export type AuthFeatureAccess = {
  authenticated: boolean;
  autoLoggedIn: boolean;
  isOwner: boolean;
  user: null | {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  role: string | null;
  tenant: null | {
    id: string | null;
    slug: string | null;
    name: string | null;
  };
  entitlements: readonly string[];
  features: {
    reader: {
      persist: boolean;
      edit: boolean;
      upload: boolean;
    };
    listen: {
      privateAccess: boolean;
    };
    admin: {
      access: boolean;
    };
  };
};

export function isAuthenticatedViewer(viewer: AuthViewer | null | undefined) {
  return Boolean(viewer?.authenticated && viewer.user);
}

export function isOwnerViewer(viewer: AuthViewer | null | undefined) {
  return isAuthenticatedViewer(viewer) && viewer?.user?.role === 'owner';
}

export function canPersistReaderData(viewer: AuthViewer | null | undefined) {
  return Boolean(viewer?.user?.canPersistReader);
}

export function canEditReaderData(viewer: AuthViewer | null | undefined) {
  return Boolean(viewer?.user?.canEditReader);
}

export function canUploadReaderData(viewer: AuthViewer | null | undefined) {
  return Boolean(viewer?.user?.canUploadReaderAssets);
}

export function canViewPrivateListen(viewer: AuthViewer | null | undefined) {
  return Boolean(viewer?.user?.canViewPrivateListen);
}

export function canAccessAdminSurface(viewer: AuthViewer | null | undefined) {
  return Boolean(viewer?.user?.canAccessAdmin);
}

export function getViewerFeatureAccess(
  viewer: AuthViewer | null | undefined,
): AuthFeatureAccess {
  return {
    authenticated: isAuthenticatedViewer(viewer),
    autoLoggedIn: Boolean(viewer?.autoLoggedIn),
    isOwner: isOwnerViewer(viewer),
    user: viewer?.user
      ? {
          id: viewer.user.id,
          email: viewer.user.email,
          displayName: viewer.user.displayName,
          avatarUrl: viewer.user.avatarUrl,
        }
      : null,
    role: viewer?.user?.role ?? null,
    tenant: viewer?.user?.tenant ?? null,
    entitlements: viewer?.user?.entitlements ?? [],
    features: {
      reader: {
        persist: canPersistReaderData(viewer),
        edit: canEditReaderData(viewer),
        upload: canUploadReaderData(viewer),
      },
      listen: {
        privateAccess: canViewPrivateListen(viewer),
      },
      admin: {
        access: canAccessAdminSurface(viewer),
      },
    },
  };
}
