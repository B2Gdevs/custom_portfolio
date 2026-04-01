/**
 * Curated scene fragments keyed for programmatic use (CLI, Copilot, batch covers).
 * Expand with beats from books planning; do not paste full manuscript text here.
 */
export type MagicbornSceneSeed = {
  /** Stable id, e.g. book slug + beat id */
  key: string;
  /** Short label for CLI/UI */
  title: string;
  /** OpenAI-ready scene description (no style — style is prepended separately) */
  prompt: string;
};

export const MAGICBORN_SCENE_SEEDS: readonly MagicbornSceneSeed[] = [
  {
    key: 'mordreds-tale:ash-court-tension',
    title: "Mordred's Tale — ash court tension",
    prompt:
      'A tense council chamber in a kingdom under strain: ash-gray banners, a long ' +
      'table of wary nobles, a young ruler figure listening while dissent simmers; ' +
      'candles and storm light through tall windows.',
  },
  {
    key: 'magicborn-line:rune-path-waystone',
    title: 'Rune Path — waystone road',
    prompt:
      'A traveler on a broken road approaching a carved waystone that faintly glows ' +
      'with etched runes; wind, distant mountains, sense of a path chosen under pressure.',
  },
];

const byKey = new Map(MAGICBORN_SCENE_SEEDS.map((s) => [s.key, s]));

export function getMagicbornSceneSeed(key: string): MagicbornSceneSeed | undefined {
  return byKey.get(key);
}

export function listMagicbornSceneSeedKeys(): string[] {
  return [...byKey.keys()];
}
