import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Parse `--scenes` CSV and/or `--scenes-file` (one label per line) for `magicborn batch`.
 */
export function parseBatchScenes(
  scenesCsv: string | undefined,
  scenesFile: string | undefined,
  repoRoot: string,
): string[] {
  const fromFile = scenesFile?.trim();
  if (fromFile) {
    const p = path.isAbsolute(fromFile) ? fromFile : path.join(repoRoot, fromFile);
    const text = readFileSync(p, 'utf8');
    return text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const csv = scenesCsv?.trim();
  if (csv) {
    return csv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}
