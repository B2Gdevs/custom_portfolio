import {
  canAccessAdminSurface,
  canEditReaderData,
  canPersistReaderData,
  canUploadReaderData,
  canViewPrivateListen,
  getViewerFeatureAccess,
  isAuthenticatedViewer,
  isOwnerViewer,
} from '@/lib/auth/permissions';
import { viewerFromUser } from '@/lib/auth/viewer';
import { OWNER_DEFAULT_ENTITLEMENTS } from '@/lib/auth/config';

describe('auth permissions', () => {
  it('maps owner viewers into a shared feature access contract', () => {
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

    expect(isAuthenticatedViewer(viewer)).toBe(true);
    expect(isOwnerViewer(viewer)).toBe(true);
    expect(canPersistReaderData(viewer)).toBe(true);
    expect(canEditReaderData(viewer)).toBe(true);
    expect(canUploadReaderData(viewer)).toBe(true);
    expect(canViewPrivateListen(viewer)).toBe(true);
    expect(canAccessAdminSurface(viewer)).toBe(true);
    expect(getViewerFeatureAccess(viewer)).toEqual({
      authenticated: true,
      autoLoggedIn: true,
      isOwner: true,
      user: {
        id: 'user_1',
        email: 'owner@magicborn.local',
        displayName: 'Ben Garrard',
        avatarUrl: '/images/my_avatar.jpeg',
      },
      role: 'owner',
      tenant: {
        id: 'tenant_1',
        slug: 'magicborn-studios',
        name: 'Magicborn Studios',
      },
      entitlements: OWNER_DEFAULT_ENTITLEMENTS,
      features: {
        reader: {
          persist: true,
          edit: true,
          upload: true,
        },
        listen: {
          privateAccess: true,
        },
        admin: {
          access: true,
        },
      },
    });
  });

  it('reports anonymous viewers as fully gated', () => {
    const access = getViewerFeatureAccess(viewerFromUser(null));

    expect(access).toEqual({
      authenticated: false,
      autoLoggedIn: false,
      isOwner: false,
      user: null,
      role: null,
      tenant: null,
      entitlements: [],
      features: {
        reader: {
          persist: false,
          edit: false,
          upload: false,
        },
        listen: {
          privateAccess: false,
        },
        admin: {
          access: false,
        },
      },
    });
  });
});
