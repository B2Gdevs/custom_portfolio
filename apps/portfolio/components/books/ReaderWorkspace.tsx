'use client';

import {
  ReaderWorkspace as ReaderWorkspaceBase,
  type ReaderPersistenceAdapter,
  type ReaderPlanningCockpitPayload,
  type ReaderWorkspaceUploadInput,
} from '@portfolio/repub-builder/reader';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { RepoPlannerCockpitClient } from '@/components/repo-planner/RepoPlannerCockpitClient';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  fetchReaderPersistedState,
  fetchReaderWorkspaceBootstrap,
  saveReaderWorkspaceSettings,
  saveReaderPersistedState,
  uploadReaderLibraryEpub,
} from '@/lib/reader/client';
import {
  mapWorkspaceLibraryRecordsToReaderBooks,
  resolveInitialReaderBook,
} from '@/lib/reader/workspace-library';
import type { ReaderWorkspaceBootstrap } from '@/lib/reader/workspace-contract';
import {
  magicbornRunePathRepoPlannerModalPayload,
  mordredsLegacyRepoPlannerModalPayload,
  mordredsTaleRepoPlannerModalPayload,
} from '@/lib/repo-planner/reader-book-modal-payloads';
import type { BookEntry } from '@/lib/books';

const READER_BOOK_PLANNING_PAYLOADS: Record<
  string,
  () => ReaderPlanningCockpitPayload
> = {
  mordreds_tale: mordredsTaleRepoPlannerModalPayload,
  mordreds_legacy: mordredsLegacyRepoPlannerModalPayload,
  magicborn_rune_path: magicbornRunePathRepoPlannerModalPayload,
};

export default function ReaderWorkspace({
  books,
  ...rest
}: {
  books: BookEntry[];
  initialBook?: BookEntry;
  initialRecordId?: string;
  initialAt?: string;
  initialCfi?: string;
}) {
  const [workspaceBootstrap, setWorkspaceBootstrap] = useState<ReaderWorkspaceBootstrap | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetchReaderWorkspaceBootstrap()
      .then((workspace) => {
        if (cancelled) return;
        setWorkspaceBootstrap(workspace);
      })
      .catch(() => {
        if (cancelled) return;
        setWorkspaceBootstrap(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const uploadedLibraryBooks = useMemo(
    () => mapWorkspaceLibraryRecordsToReaderBooks(workspaceBootstrap?.libraryRecords ?? []),
    [workspaceBootstrap?.libraryRecords],
  );

  const combinedBooks = useMemo(
    () => [...books, ...uploadedLibraryBooks],
    [books, uploadedLibraryBooks],
  );

  const resolvedInitialBook = useMemo(
    () =>
      resolveInitialReaderBook({
        uploadedBooks: uploadedLibraryBooks,
        initialBook: rest.initialBook,
        initialRecordId: rest.initialRecordId,
      }),
    [uploadedLibraryBooks, rest.initialBook, rest.initialRecordId],
  );

  const readerPersistenceAdapter = useMemo<ReaderPersistenceAdapter | null>(() => {
    if (!workspaceBootstrap?.access.canPersist) {
      return null;
    }

    return {
      loadState: async ({ storageKey, contentHash }) =>
        fetchReaderPersistedState({
          storageKey,
          contentHash,
        }),
      saveState: async (input) => {
        await saveReaderPersistedState({
          storageKey: input.storageKey,
          contentHash: input.contentHash,
          bookSlug: input.bookSlug,
          sourceKind: input.sourceKind === 'uploaded' ? 'uploaded' : 'built-in',
          location: input.location,
          progress: input.progress,
          annotations: input.annotations,
        });
      },
    };
  }, [workspaceBootstrap?.access.canPersist]);

  const handleSaveWorkspaceSettings = async (
    input: ReaderWorkspaceBootstrap['settings'],
  ) => {
    const saved = await saveReaderWorkspaceSettings(input);
    if (!saved) {
      return;
    }

    setWorkspaceBootstrap((current) =>
      current
        ? {
            ...current,
            settings: saved,
          }
        : current,
    );
  };

  const handleUploadImportedBook = async (input: ReaderWorkspaceUploadInput) => {
    const record = await uploadReaderLibraryEpub({
      file: input.file,
      title: input.title,
      author: input.author ?? null,
      description: input.description ?? null,
      visibility: input.visibility,
    });

    if (!record) {
      return;
    }

    setWorkspaceBootstrap((current) =>
      current
        ? {
            ...current,
            libraryRecords: [record, ...current.libraryRecords],
          }
        : current,
    );
  };

  return (
    <ReaderWorkspaceBase
      books={combinedBooks}
      readerPersistenceAdapter={readerPersistenceAdapter}
      workspaceAccess={workspaceBootstrap?.access ?? null}
      workspaceSettings={workspaceBootstrap?.settings ?? null}
      workspaceLibraryRecords={workspaceBootstrap?.libraryRecords ?? []}
      onSaveWorkspaceSettings={handleSaveWorkspaceSettings}
      onUploadImportedBook={handleUploadImportedBook}
      initialBook={resolvedInitialBook}
      ReaderLink={Link}
      readerToolbarStart={
        <SidebarTrigger className="shrink-0 border-border bg-dark text-text-muted hover:bg-dark-elevated hover:text-primary" />
      }
      getPlanningStripConfig={(bookSlug) => {
        if (!bookSlug) return null;
        const factory = READER_BOOK_PLANNING_PAYLOADS[bookSlug];
        return factory ? { cockpitPayload: factory() } : null;
      }}
      renderPlanningCockpit={(payload, _onClose, epubPlanning) => (
        <RepoPlannerCockpitClient
          hostContext={payload}
          loadSiteBuiltinPacks={false}
          readerPlanningInjection={
            epubPlanning && epubPlanning.bookSlug === payload.readingTargetId
              ? epubPlanning
              : null
          }
        />
      )}
      initialAt={rest.initialAt}
      initialCfi={rest.initialCfi}
    />
  );
}
