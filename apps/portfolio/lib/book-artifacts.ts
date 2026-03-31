export type PublishedBookArtifactKind = 'epub' | 'planning-pack';

export type PublishedBookManifestFields = {
  remoteEpubUrl?: string;
  planningPackUrl?: string;
  artifactVersion?: string | null;
};

export function sanitizeArtifactVersionTag(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function buildDefaultArtifactVersionTag(input?: {
  now?: Date;
  shortCommit?: string | null;
}) {
  const now = input?.now ?? new Date();
  const shortCommit = sanitizeArtifactVersionTag(input?.shortCommit ?? 'local') || 'local';
  const date = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
  ].join('');
  const time = [
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
    String(now.getUTCSeconds()).padStart(2, '0'),
  ].join('');

  return `cp-${date}-${time}-${shortCommit}`;
}

export function buildPublishedBookArtifactFilename(
  bookSlug: string,
  artifactKind: PublishedBookArtifactKind,
  versionTag: string,
  extension: string,
) {
  const normalizedVersion = sanitizeArtifactVersionTag(versionTag) || 'current';
  const normalizedExt = extension.replace(/^\./, '').toLowerCase();
  return `${bookSlug}--${artifactKind}--${normalizedVersion}.${normalizedExt}`;
}

export function preservePublishedBookManifestFields<
  T extends PublishedBookManifestFields,
>(nextEntry: T, previousEntry?: PublishedBookManifestFields | null): T {
  if (!previousEntry) {
    return nextEntry;
  }

  return {
    ...nextEntry,
    remoteEpubUrl: nextEntry.remoteEpubUrl ?? previousEntry.remoteEpubUrl,
    planningPackUrl: nextEntry.planningPackUrl ?? previousEntry.planningPackUrl,
    artifactVersion: nextEntry.artifactVersion ?? previousEntry.artifactVersion ?? null,
  };
}

export function getPublishedBookDownloadUrl(input: {
  slug: string;
  remoteEpubUrl?: string | null;
}) {
  const remote = input.remoteEpubUrl?.trim();
  return remote && remote.length > 0 ? remote : `/books/${input.slug}/book.epub`;
}
