/**
 * REPL tab completion: first token → primary commands; then multi-token suffixes.
 * Slash mode: same targets, prefixed with `/` for discoverability.
 */

export const PRIMARY_COMMANDS: readonly string[] = [
  'book',
  'planning-pack',
  'listen',
  'style',
  'model',
  'payload',
  'vendor',
  'openai',
  'chat',
  'pnpm',
  'update',
  'completion',
  'env',
  'shell-init',
  'app',
  'project',
  'help',
  'clear',
  'exit',
  'quit',
];

/** Second+ tokens (full remainder after primary) for common flows. */
export const SUFFIXES_BY_PRIMARY: Readonly<Record<string, readonly string[]>> = {
  book: ['generate', 'scenes list', 'scenes extract'],
  'planning-pack': ['generate'],
  listen: ['generate'],
  style: ['show', 'set', 'clear', 'suggest'],
  model: ['get', 'set', 'recommend', 'list', 'config'],
  payload: ['collections', 'app generate'],
  vendor: ['list', 'use', 'add'],
  openai: ['status', 'models', 'projects', 'help'],
  app: ['list', 'generate'],
  project: ['list', 'generate'],
  completion: ['bash', 'zsh', 'fish'],
  env: ['--json'],
};

/**
 * Flat list for `/` palette: actionable lines (same argv as typing without `magicborn`).
 */
export const SLASH_MENU_LINES: readonly string[] = [
  'app generate',
  'app list',
  'book generate',
  'book scenes extract',
  'book scenes list',
  'chat',
  'clear',
  'completion bash',
  'completion fish',
  'completion zsh',
  'env',
  'env --json',
  'help',
  'listen generate',
  'model config',
  'model get',
  'model list',
  'model recommend',
  'model set',
  'openai help',
  'openai models',
  'openai projects',
  'openai status',
  'payload app generate',
  'payload collections',
  'planning-pack generate',
  'project generate',
  'project list',
  'shell-init',
  'style clear',
  'style set',
  'style show',
  'style suggest',
  'update',
  'vendor add',
  'vendor list',
  'vendor use',
];

function commonPrefix(strings: string[]): string {
  if (strings.length === 0) return '';
  const first = strings[0]!;
  let i = 0;
  outer: for (; i < first.length; i++) {
    const c = first[i];
    for (const s of strings) {
      if (s[i] !== c) break outer;
    }
  }
  return first.slice(0, i);
}

function stripSlash(raw: string): { slash: boolean; body: string } {
  if (raw.startsWith('/')) {
    return { slash: true, body: raw.slice(1) };
  }
  return { slash: false, body: raw };
}

function withSlash(slash: boolean, line: string): string {
  if (!slash) return line;
  return line.length > 0 ? `/${line}` : '/';
}

/** Suffixes that match the partial tail (second token onward). */
function matchingSuffixes(primary: string, tailTrimmed: string): string[] {
  const suf = SUFFIXES_BY_PRIMARY[primary];
  if (!suf?.length) return [];
  if (!tailTrimmed) return [...suf];
  return suf.filter((s) => {
    if (s.startsWith(tailTrimmed)) return true;
    const firstTok = s.split(/\s+/)[0] ?? '';
    return firstTok.startsWith(tailTrimmed) || tailTrimmed.startsWith(firstTok);
  });
}

/** Normalized line with a single trailing space for the REPL. */
function finishCommandLine(primary: string, suffix: string): string {
  const tail = suffix.trim().length > 0 ? `${primary} ${suffix}` : primary;
  return `${tail.trimEnd()} `;
}

/**
 * Return updated line after Tab, or null if no change.
 */
export function applyTabCompletion(rawLine: string): string | null {
  const { slash, body } = stripSlash(rawLine);
  const endsWithSpace = /\s$/.test(body);
  const core = body.trimEnd();
  if (core.length === 0) return null;

  const parts = core.split(/\s+/);
  const first = parts[0] ?? '';

  // Completing first token only
  if (parts.length === 1 && !endsWithSpace) {
    const hits = PRIMARY_COMMANDS.filter((p) => p.startsWith(first));
    if (hits.length === 0) return null;
    if (hits.length === 1) {
      const w = hits[0]!;
      if (w === first) {
        const nextSuf = SUFFIXES_BY_PRIMARY[w]?.[0];
        if (nextSuf) {
          return withSlash(slash, finishCommandLine(w, nextSuf));
        }
        return withSlash(slash, finishCommandLine(w, ''));
      }
      return withSlash(slash, finishCommandLine(w, ''));
    }
    const cp = commonPrefix([...hits]);
    if (cp.length > first.length) {
      return withSlash(slash, cp);
    }
    return null;
  }

  // First token locked: "book " or "book gen" or "book scenes" …
  const primaryHit = PRIMARY_COMMANDS.find((p) => p === first);
  if (!primaryHit) return null;

  const tailParts = parts.slice(1);
  const tailTrimmed = tailParts.join(' ').trim();

  if (parts.length === 1 && endsWithSpace) {
    const suf = SUFFIXES_BY_PRIMARY[primaryHit]?.[0];
    if (!suf) return withSlash(slash, finishCommandLine(primaryHit, ''));
    return withSlash(slash, finishCommandLine(primaryHit, suf));
  }

  const candidates = matchingSuffixes(primaryHit, tailTrimmed);
  if (candidates.length === 0) return null;

  if (candidates.length === 1) {
    const c = candidates[0]!;
    return withSlash(slash, finishCommandLine(primaryHit, c));
  }

  const cp = commonPrefix(candidates);
  const restNoSpace = tailTrimmed.length > 0 ? `${primaryHit} ${tailTrimmed}` : primaryHit;
  const builtNoTrim = `${primaryHit} ${cp}`;
  if (cp.length > tailTrimmed.length && builtNoTrim.replace(/\s+$/, '').startsWith(restNoSpace.replace(/\s+$/, ''))) {
    return withSlash(slash, finishCommandLine(primaryHit, cp));
  }

  const sorted = [...candidates].sort((a, b) => a.length - b.length || a.localeCompare(b));
  const pick = sorted.find((c) => !tailTrimmed || c !== tailTrimmed) ?? sorted[0]!;
  return withSlash(slash, finishCommandLine(primaryHit, pick));
}

/** Dim ghost after current value (prefix of what Tab would insert). */
export function completionGhostAfter(rawLine: string): string | null {
  const next = applyTabCompletion(rawLine);
  if (!next) return null;
  if (next.length <= rawLine.length) return null;
  if (!next.startsWith(rawLine)) return null;
  return next.slice(rawLine.length);
}

/** Lines to show for `/` palette (after the `/`). */
export function filterSlashPalette(rawLine: string, limit = 10): string[] {
  if (!rawLine.startsWith('/')) return [];
  const q = rawLine.slice(1).trim().toLowerCase();
  const lines = [...new Set(SLASH_MENU_LINES)].sort((a, b) => a.localeCompare(b));
  if (!q) return lines.slice(0, limit).map((l) => `/${l}`);
  const hits = lines
    .filter((l) => {
      const low = l.toLowerCase();
      return low.startsWith(q) || q.split(/\s+/).every((t) => low.includes(t));
    })
    .map((l) => `/${l}`);
  return hits.slice(0, limit);
}

/**
 * `/` palette: runtime lines first (e.g. `/vendor use <id>`), then static menu, deduped.
 */
export function mergeSlashPalette(
  rawLine: string,
  extraLines: readonly string[],
  staticFetchLimit = 80,
  mergedLimit = 14,
): string[] {
  if (!rawLine.startsWith('/')) return [];
  const q = rawLine.slice(1).trim().toLowerCase();
  const staticPart = filterSlashPalette(rawLine, staticFetchLimit);

  const extraMatches = (line: string): boolean => {
    if (!q) return true;
    const low = line.toLowerCase();
    const body = low.startsWith('/') ? low.slice(1) : low;
    return low.startsWith(`/${q}`) || body.startsWith(q);
  };

  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of extraLines) {
    if (!extraMatches(x)) continue;
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
    if (out.length >= mergedLimit) return out;
  }
  for (const s of staticPart) {
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= mergedLimit) break;
  }
  return out;
}
