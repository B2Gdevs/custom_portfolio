import type { ReaderPlanningCockpitPayload } from '@portfolio/repub-builder/reader';

/** Payload for reader **`readerModalStore`** / global Repo Planner modal from the EPUB reader strip. */
export function mordredsTaleRepoPlannerModalPayload(): ReaderPlanningCockpitPayload {
  return {
    readingTargetId: 'mordreds_tale',
    surfaceLabel: "Mordred's Tale",
  };
}

export function mordredsLegacyRepoPlannerModalPayload(): ReaderPlanningCockpitPayload {
  return {
    readingTargetId: 'mordreds_legacy',
    surfaceLabel: "Mordred's Legacy",
  };
}

export function magicbornRunePathRepoPlannerModalPayload(): ReaderPlanningCockpitPayload {
  return {
    readingTargetId: 'magicborn_rune_path',
    surfaceLabel: 'Magicborn: The Rune Path',
  };
}
