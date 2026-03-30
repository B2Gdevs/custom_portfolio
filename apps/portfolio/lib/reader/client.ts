import type { ReaderPersistedState, ReaderPersistedStateInput } from './reading-state-contract';
import type { ReaderWorkspaceBootstrap } from './workspace-contract';

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function fetchReaderWorkspaceBootstrap(init?: RequestInit) {
  const response = await fetch('/api/reader/workspace', {
    method: 'GET',
    credentials: 'include',
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Failed to load reader workspace bootstrap (${response.status})`);
  }

  const body = await parseJson<{ ok: true; workspace: ReaderWorkspaceBootstrap }>(response);
  return body.workspace;
}

export async function fetchReaderPersistedState(input: {
  storageKey: string;
  contentHash: string;
}) {
  const params = new URLSearchParams({
    storageKey: input.storageKey,
    contentHash: input.contentHash,
  });
  const response = await fetch(`/api/reader/state?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to load reader state (${response.status})`);
  }

  const body = await parseJson<{ ok: true; state: ReaderPersistedState | null }>(response);
  return body.state;
}

export async function saveReaderPersistedState(input: ReaderPersistedStateInput) {
  const response = await fetch('/api/reader/state', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to save reader state (${response.status})`);
  }

  const body = await parseJson<{ ok: true; state: ReaderPersistedState | null }>(response);
  return body.state;
}
