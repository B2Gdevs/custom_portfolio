/**
 * Scene-play → video prompt stub (global-tooling-06-04). No provider yet; validate + compose only.
 */

const MAX_STUB_LEN = 120_000;

export function composeScenePlayVideoPromptStub(
  scenePlayText: string,
  styleLine?: string,
): string {
  const play = scenePlayText.trim();
  if (!play) {
    throw new Error('scenePlayText is empty');
  }
  const style = styleLine?.trim();
  return style ? `${play}\n\nStyle: ${style}` : play;
}

export function validateVideoPromptStub(
  stub: string,
): { ok: true } | { ok: false; reason: 'empty' | 'too_long' } {
  const t = stub.trim();
  if (!t) return { ok: false, reason: 'empty' };
  if (t.length > MAX_STUB_LEN) return { ok: false, reason: 'too_long' };
  return { ok: true };
}
