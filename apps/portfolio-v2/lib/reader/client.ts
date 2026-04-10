import type { ReaderPersistedState, ReaderPersistedStateInput } from './reading-state-contract';
import type { ReaderWorkspaceBootstrap } from './workspace-contract';
import type { ReaderLibraryRecord } from './workspace-contract';
import type { ReaderWorkspaceSettingsInput } from './workspace-write-contract';

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

export async function saveReaderWorkspaceSettings(input: ReaderWorkspaceSettingsInput) {
  const response = await fetch('/api/reader/workspace/settings', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Failed to save reader workspace settings (${response.status})`);
  }

  const body = await parseJson<{ ok: true; settings: ReaderWorkspaceBootstrap['settings'] | null }>(
    response,
  );
  return body.settings;
}

export async function uploadReaderLibraryEpub(input: {
  file: File;
  title: string;
  author?: string | null;
  description?: string | null;
  visibility: 'private' | 'public';
}) {
  const formData = new FormData();
  formData.set('file', input.file);
  formData.set('title', input.title);
  formData.set('author', input.author ?? '');
  formData.set('description', input.description ?? '');
  formData.set('visibility', input.visibility);

  const response = await fetch('/api/reader/library/upload', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload reader EPUB (${response.status})`);
  }

  const body = await parseJson<{ ok: true; record: ReaderLibraryRecord | null }>(response);
  return body.record;
}
