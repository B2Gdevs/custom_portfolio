import { getViewerFeatureAccess } from '@/lib/auth/permissions';
import { getSessionViewer } from '@/lib/auth/session';
import {
  DEFAULT_READER_WORKSPACE_SETTINGS,
  resolveReaderWorkspaceAccess,
  type ReaderWorkspaceBootstrap,
} from './workspace-contract';
import { getReaderWorkspaceRepository } from './workspace-repository';

export async function getReaderWorkspaceBootstrap(
  request?: Request,
): Promise<ReaderWorkspaceBootstrap> {
  const viewer = await getSessionViewer(
    request ?? new Request('http://localhost/api/reader/workspace'),
  );
  const featureAccess = getViewerFeatureAccess(viewer);
  const access = resolveReaderWorkspaceAccess(featureAccess);
  const tenantId = viewer.user?.tenant?.id ?? null;
  const userId = viewer.user?.id ?? null;

  if (!featureAccess.authenticated || !tenantId || !userId) {
    return {
      access,
      settings: DEFAULT_READER_WORKSPACE_SETTINGS,
      libraryRecords: [],
    };
  }

  const repository = getReaderWorkspaceRepository();
  const workspace = await repository.getWorkspace({
    tenantId,
    userId,
  });

  return {
    access,
    settings: workspace.settings,
    libraryRecords: workspace.libraryRecords,
  };
}
