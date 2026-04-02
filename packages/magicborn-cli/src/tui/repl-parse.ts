/**
 * Parse a single REPL line into argv tokens (quotes, optional leading /).
 */

export function splitArgvLine(input: string): string[] {
  const s = input.trim();
  if (!s) return [];
  const parts: string[] = [];
  let cur = '';
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (quote) {
      if (c === quote) {
        quote = null;
        continue;
      }
      cur += c;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (/\s/.test(c)) {
      if (cur.length) {
        parts.push(cur);
        cur = '';
      }
      continue;
    }
    cur += c;
  }
  if (cur.length) parts.push(cur);
  return parts;
}

/** Strip optional slash prefix (slash commands). */
export function parseReplLine(line: string): string[] {
  const t = line.trim();
  if (!t) return [];
  const body = t.startsWith('/') ? t.slice(1).trim() : t;
  if (!body) return [];
  return splitArgvLine(body);
}
