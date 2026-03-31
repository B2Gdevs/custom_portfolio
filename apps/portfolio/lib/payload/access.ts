import type { Access, Where } from 'payload';
import { canUploadReaderData } from '@/lib/auth/permissions';
import { viewerFromUser } from '@/lib/auth/viewer';

function getViewerTenantId(req: Parameters<Access>[0]['req']) {
  const viewer = viewerFromUser(req.user);
  if (!viewer.authenticated || !viewer.user || !canUploadReaderData(viewer)) {
    return null;
  }

  return viewer.user.tenant?.id ?? null;
}

export const canManageReaderUploadCollection: Access = ({ req }) =>
  Boolean(getViewerTenantId(req));

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
