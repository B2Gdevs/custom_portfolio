'use client';

import ReaderWorkspaceBase, { type ReaderPlanningCockpitPayload } from '@portfolio/repub-builder/reader';
import Link from 'next/link';
import { RepoPlannerCockpitClient } from '@/components/repo-planner/RepoPlannerCockpitClient';
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
  return (
    <ReaderWorkspaceBase
      books={books}
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
