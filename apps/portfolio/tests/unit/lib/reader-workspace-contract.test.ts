import {
  DEFAULT_READER_WORKSPACE_SETTINGS,
  mergeReaderWorkspaceSettings,
  normalizeReaderLibraryRecord,
  resolveReaderWorkspaceAccess,
} from '@/lib/reader/workspace-contract';

describe('reader workspace contract', () => {
  it('keeps anonymous sessions in local-only mode', () => {
    expect(
      resolveReaderWorkspaceAccess({
        authenticated: false,
        autoLoggedIn: false,
        isOwner: false,
        role: null,
        tenant: null,
        entitlements: [],
        features: {
          reader: { persist: false, edit: false, upload: false },
          listen: { privateAccess: false },
          admin: { access: false },
        },
      }),
    ).toEqual({
      authenticated: false,
      autoLoggedIn: false,
      isOwner: false,
      canPersist: false,
      canEdit: false,
      canUpload: false,
      uploadRequiresExplicitAction: true,
      localImportMode: 'local-only',
      storageMode: 'local-only',
    });
  });

  it('elevates entitled owner sessions into hybrid mode', () => {
    expect(
      resolveReaderWorkspaceAccess({
        authenticated: true,
        autoLoggedIn: true,
        isOwner: true,
        role: 'owner',
        tenant: { id: 'tenant-1', slug: 'magicborn-studios', name: 'Magicborn Studios' },
        entitlements: ['reader:sync', 'reader:edit', 'reader:upload'],
        features: {
          reader: { persist: true, edit: true, upload: true },
          listen: { privateAccess: true },
          admin: { access: true },
        },
      }),
    ).toEqual({
      authenticated: true,
      autoLoggedIn: true,
      isOwner: true,
      canPersist: true,
      canEdit: true,
      canUpload: true,
      uploadRequiresExplicitAction: true,
      localImportMode: 'local-only',
      storageMode: 'hybrid',
    });
  });

  it('merges settings onto the default contract', () => {
    expect(
      mergeReaderWorkspaceSettings({
        defaultWorkspaceView: 'continue-reading',
        showProgressBadges: false,
      }),
    ).toEqual({
      ...DEFAULT_READER_WORKSPACE_SETTINGS,
      defaultWorkspaceView: 'continue-reading',
      showProgressBadges: false,
    });
  });

  it('normalizes reader library docs', () => {
    expect(
      normalizeReaderLibraryRecord({
        id: 'rec_1',
        title: 'Uploaded EPUB',
        sourceKind: 'uploaded',
        visibility: 'public',
        sourceFileName: 'uploaded.epub',
      }),
    ).toEqual({
      id: 'rec_1',
      title: 'Uploaded EPUB',
      bookSlug: null,
      author: null,
      description: null,
      coverImageUrl: null,
      sourceKind: 'uploaded',
      sourceFileName: 'uploaded.epub',
      visibility: 'public',
      updatedAt: null,
    });
  });
});
