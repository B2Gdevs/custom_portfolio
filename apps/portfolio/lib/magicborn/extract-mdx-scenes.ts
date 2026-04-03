/**
 * Heuristic scene / section extraction from MDX or Markdown source (global-tooling-05-05).
 * Splits on `##` (H2) headings; optional filter for “scene-like” titles.
 */

export type ExtractedSceneBlock = {
  /** 0-based order within the file */
  index: number;
  heading: string;
  /** 1-based line number of the `##` heading line in the stripped source */
  lineStart: number;
  /** Prose under this heading until the next `##` */
  body: string;
};

const SCENE_LIKE_RE =
  /scene|chapter|part|fragment|letter|beat|article|interlude|sequence|moment|opening|finale|prologue|epilogue/i;

/**
 * Split stripped MDX/Markdown on top-level `##` headings (H2 only).
 */
export function extractH2Sections(source: string): ExtractedSceneBlock[] {
  const lines = source.split(/\r?\n/);
  const out: ExtractedSceneBlock[] = [];
  let i = 0;
  let blockIndex = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^##\s+(.+)$/);
    if (m) {
      const heading = m[1].trim().replace(/\s+#+\s*$/, '').trim();
      const lineStart = i + 1;
      i += 1;
      const bodyLines: string[] = [];
      while (i < lines.length && !/^##\s/.test(lines[i])) {
        bodyLines.push(lines[i]);
        i += 1;
      }
      out.push({
        index: blockIndex,
        heading,
        lineStart,
        body: bodyLines.join('\n').trim(),
      });
      blockIndex += 1;
      continue;
    }
    i += 1;
  }
  return out;
}

export function isSceneLikeHeading(heading: string): boolean {
  return SCENE_LIKE_RE.test(heading.trim());
}

/**
 * @param includeAllHeadings — when false, keep only headings matching {@link isSceneLikeHeading}.
 */
export function extractSceneCandidatesFromMdx(
  source: string,
  options?: { includeAllHeadings?: boolean },
): ExtractedSceneBlock[] {
  const all = extractH2Sections(source);
  if (options?.includeAllHeadings) {
    return all;
  }
  const filtered = all.filter((b) => isSceneLikeHeading(b.heading));
  return filtered.map((b, i) => ({ ...b, index: i }));
}
