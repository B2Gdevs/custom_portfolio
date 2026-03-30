'use client';

import { useEffect, useState } from 'react';
import { PlanningCockpit } from 'repo-planner';
import type { CockpitHostContext } from 'repo-planner/cockpit-host-context';
import {
  builtinEmbedPackToPlanningPack,
  defaultPlanningHostPolicy,
  PlanningCockpitDashboard,
  RepoPlannerWorkspaceShell,
} from 'repo-planner/host';
import {
  extractPlanningPackFromEpub,
  readerBookPlanningPackId,
} from '@portfolio/repub-builder/reader';
import type { BuiltinEmbedPack, BuiltinEmbedPacksPayload } from 'repo-planner/planning-pack';
import type { PlanningPack } from '@/lib/repo-planner-workspace-storage';

/** Re-export for hosts/tests that need the per-slug id rule. */
export { readerBookPlanningPackId };

/**
 * @deprecated Legacy static pack id from pre-EPUB embed packs. Use {@link readerBookPlanningPackId} with the catalog slug.
 */
export const READER_BOOK_PLANNING_PACK_ID = 'book-books-planning';

const portfolioRepoPlannerPolicy = {
  ...defaultPlanningHostPolicy,
  testsRequiredForDone: true,
  globalReadOrderFirst: true,
  sprintSize: 5,
  kickoffHoursThreshold: 6,
  hideRawSourceInInspector: true,
  immutableIds: true,
  allowPackIdMigration: true,
};

export function RepoPlannerCockpitClient({
  hostContext,
  /** Reader workspace: book-scoped embed pack, not site `/planning-embed/builtin-packs.json`. */
  loadSiteBuiltinPacks = true,
  /** When aligned with `hostContext.readingTargetId`, EPUB bytes are parsed before `/book-packs/` fetch. */
  readerPlanningInjection,
}: {
  hostContext?: CockpitHostContext;
  loadSiteBuiltinPacks?: boolean;
  readerPlanningInjection?: { buffer: ArrayBuffer; bookSlug: string } | null;
}) {
  const [builtinPacks, setBuiltinPacks] = useState<PlanningPack[]>([]);

  useEffect(() => {
    let cancelled = false;

    const setPacksSafe = (packs: PlanningPack[]) => {
      if (!cancelled) setBuiltinPacks(packs);
    };

    if (loadSiteBuiltinPacks) {
      const sourceUrl = '/planning-embed/builtin-packs.json';
      fetch(sourceUrl)
        .then((r) => (r.ok ? r.json() : null))
        .then((payload: BuiltinEmbedPacksPayload | null) => {
          if (cancelled) return;
          setBuiltinPacks(
            payload?.packs?.length ? payload.packs.map((p) => builtinEmbedPackToPlanningPack(p)) : [],
          );
        })
        .catch(() => {
          if (!cancelled) setBuiltinPacks([]);
        });
      return () => {
        cancelled = true;
      };
    }

    const targetId = hostContext?.readingTargetId;

    const run = async () => {
      const inj = readerPlanningInjection;
      const injAligned =
        inj && targetId && inj.bookSlug === targetId ? inj : null;

      if (injAligned && targetId) {
        try {
          const extracted = await extractPlanningPackFromEpub(injAligned.buffer, {
            bookSlug: injAligned.bookSlug,
            packLabel: hostContext?.surfaceLabel
              ? `${hostContext.surfaceLabel} — planning`
              : undefined,
          });
          if (cancelled) return;
          if (extracted?.files?.length) {
            setPacksSafe([builtinEmbedPackToPlanningPack(extracted as BuiltinEmbedPack)]);
            return;
          }
        } catch {
          /* fall through to JSON fallback */
        }
      }

      if (!targetId) {
        setPacksSafe([]);
        return;
      }

      const sourceUrl = `/planning-embed/book-packs/${encodeURIComponent(targetId)}.json`;
      try {
        const r = await fetch(sourceUrl);
        const payload = r.ok ? ((await r.json()) as BuiltinEmbedPacksPayload) : null;
        if (cancelled) return;
        setPacksSafe(
          payload?.packs?.length ? payload.packs.map((p) => builtinEmbedPackToPlanningPack(p)) : [],
        );
      } catch {
        if (!cancelled) setPacksSafe([]);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadSiteBuiltinPacks, hostContext?.readingTargetId, hostContext?.surfaceLabel, readerPlanningInjection]);

  const preferBuiltinPackId =
    !loadSiteBuiltinPacks && hostContext?.readingTargetId
      ? readerBookPlanningPackId(hostContext.readingTargetId)
      : undefined;

  return (
    <RepoPlannerWorkspaceShell className="p-3 sm:p-4">
      <PlanningCockpitDashboard
        livePane={<PlanningCockpit />}
        hostContext={hostContext}
        builtinPacks={builtinPacks}
        preferBuiltinPackId={preferBuiltinPackId}
        hostPolicy={portfolioRepoPlannerPolicy}
      />
    </RepoPlannerWorkspaceShell>
  );
}
