import type { Access, Where } from 'payload';
import {
  canAccessAdminSurface,
  canUploadReaderData,
  isOwnerViewer,
} from '@/lib/auth/permissions';
import { viewerFromUser } from '@/lib/auth/viewer';

function getOwnerAdminViewer(req: Parameters<Access>[0]['req']) {
  const viewer = viewerFromUser(req.user);
  if (!viewer.authenticated || !viewer.user) {
    return null;
  }

  if (!isOwnerViewer(viewer) || !canAccessAdminSurface(viewer)) {
    return null;
  }

  return viewer;
}

function getViewerTenantId(req: Parameters<Access>[0]['req']) {
  const viewer = viewerFromUser(req.user);
  if (!viewer.authenticated || !viewer.user || !canUploadReaderData(viewer)) {
    return null;
  }

  return viewer.user.tenant?.id ?? null;
}

export const canManageReaderUploadCollection: Access = ({ req }) =>
  Boolean(getViewerTenantId(req));

export const canManageOwnerAdminCollection: Access = ({ req }) =>
  Boolean(getOwnerAdminViewer(req));

export const readOwnerAdminCollection: Access = ({ req }) =>
  Boolean(getOwnerAdminViewer(req));

export const readReaderUploadCollection: Access = ({ req }) => {
  const tenantId = getViewerTenantId(req);
  if (!tenantId) {
    return false;
  }

  const where: Where = {
    tenant: {
      equals: tenantId,
    },
  };

  return where;
};
