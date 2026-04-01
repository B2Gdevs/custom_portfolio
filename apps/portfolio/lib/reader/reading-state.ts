import 'server-only';

import { canPersistReaderData } from '@/lib/auth/permissions';
import { getSessionViewer } from '@/lib/auth/session';
import {
  type ReaderPersistedState,
  type ReaderPersistedStateInput,
} from './reading-state-contract';
import { getReaderStateRepository } from './state-repository';

function isBuiltInReaderSource(kind: string | null | undefined) {
  return kind === 'built-in';
}

async function getPersistCapableViewer(request?: Request) {
  const viewer = await getSessionViewer(
    request ?? new Request('http://localhost/api/reader/state'),
  );

  if (!viewer.authenticated || !viewer.user || !canPersistReaderData(viewer)) {
    return null;
  }

  const tenantId = viewer.user.tenant?.id ?? null;
  if (!tenantId) {
    return null;
  }

  return {
    viewer,
    userId: viewer.user.id,
    tenantId,
  };
}

export async function getReaderPersistedState(
  input: Pick<ReaderPersistedStateInput, 'storageKey' | 'contentHash'>,
  request?: Request,
): Promise<ReaderPersistedState | null> {
  const session = await getPersistCapableViewer(request);
  if (!session) {
    return null;
  }

  const repository = getReaderStateRepository();
  return repository.get({
    tenantId: session.tenantId,
    userId: session.userId,
    storageKey: input.storageKey,
    contentHash: input.contentHash,
  });
}

export async function saveReaderPersistedState(
  input: ReaderPersistedStateInput,
  request?: Request,
): Promise<ReaderPersistedState | null> {
  const session = await getPersistCapableViewer(request);
  if (!session || !isBuiltInReaderSource(input.sourceKind)) {
    return null;
  }

  const repository = getReaderStateRepository();
  return repository.save({
    tenantId: session.tenantId,
    userId: session.userId,
    ...input,
  });
}
