import 'server-only';

import { getViewerFeatureAccess } from '@/lib/auth/permissions';
import { getSessionViewer } from '@/lib/auth/session';
import { getListenCatalog, type ListenCatalogEntry } from '@/lib/listen-catalog';
import { getListenCatalogRepository } from './listen/listen-catalog-repository';

export type ListenCatalogBootstrap = {
  access: {
    canViewPrivate: boolean;
  };
  entries: ListenCatalogEntry[];
};

export async function getListenCatalogBootstrap(
  request?: Request,
): Promise<ListenCatalogBootstrap> {
  const fallbackEntries = getListenCatalog();
  const fallback: ListenCatalogBootstrap = {
    access: {
      canViewPrivate: false,
    },
    entries: fallbackEntries,
  };

  try {
    const viewer = request ? await getSessionViewer(request) : null;
    const access = getViewerFeatureAccess(viewer);
    const repository = getListenCatalogRepository();
    const entries = await repository.listCatalog({
      canViewPrivate: access.features.listen.privateAccess,
    });

    return {
      access: {
        canViewPrivate: access.features.listen.privateAccess,
      },
      entries,
    };
  } catch {
    return fallback;
  }
}
