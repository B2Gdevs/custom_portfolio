'use client';

import {
  ReaderWorkspace as ReaderWorkspaceBase,
  type ReaderPersistenceAdapter,
  type ReaderPlanningCockpitPayload,
} from '@portfolio/repub-builder/reader';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { RepoPlannerCockpitClient } from '@/components/repo-planner/RepoPlannerCockpitClient';
import {
  fetchReaderPersistedState,
  fetchReaderWorkspaceBootstrap,
  saveReaderPersistedState,
} from '@/lib/reader/client';
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
  initialAt?: string;
  initialCfi?: string;
}) {
  const [canPersistReader, setCanPersistReader] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetchReaderWorkspaceBootstrap()
      .then((workspace) => {
        if (cancelled) return;
        setCanPersistReader(workspace.access.canPersist);
      })
      .catch(() => {
        if (cancelled) return;
        setCanPersistReader(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const readerPersistenceAdapter = useMemo<ReaderPersistenceAdapter | null>(() => {
    if (!canPersistReader) {
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
  }, [canPersistReader]);

  return (
    <ReaderWorkspaceBase
      books={books}
      readerPersistenceAdapter={readerPersistenceAdapter}
      ReaderLink={Link}
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
      {...rest}
    />
  );
}
