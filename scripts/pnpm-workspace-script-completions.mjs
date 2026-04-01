#!/usr/bin/env node
/**
 * Prints newline-separated completion candidates for package.json script names,
 * given the current partial token (segment-aware for `foo:bar:baz` keys).
 *
 * Usage: node scripts/pnpm-workspace-script-completions.mjs <repoRoot> <currentWord>
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
const cur = process.argv[3] ?? '';

if (!root) {
  process.exit(1);
}

let keys = [];
try {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  keys = Object.keys(pkg.scripts ?? {});
} catch {
  process.exit(1);
}

/** @param {string} prefix @param {string[]} scriptKeys */
function scriptCompletions(prefix, scriptKeys) {
  const out = new Set();
  for (const k of scriptKeys) {
    if (!k.startsWith(prefix)) continue;
    const rest = k.slice(prefix.length);
    if (!rest) {
      out.add(k);
      continue;
    }
    const idx = rest.indexOf(':');
    if (idx === -1) {
      out.add(k);
    } else {
      out.add(prefix + rest.slice(0, idx + 1));
    }
  }
  return [...out].sort((a, b) => a.localeCompare(b));
}

for (const line of scriptCompletions(cur, keys)) {
  console.log(line);
}
