#!/usr/bin/env node
/**
 * Prints newline-separated completion candidates for package.json script names,
 * given the current partial token (segment-aware for `foo:bar:baz` keys).
 *
 * Usage: node scripts/pnpm-workspace-script-completions.mjs <cwd> <currentWord>
 * Walks up from `cwd` to find the nearest package.json and reads its `scripts` keys.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const startDir = process.argv[2] || process.cwd();
const cur = process.argv[3] ?? '';

function findNearestPackageJsonRoot(start) {
  let dir = resolve(start);
  for (;;) {
    const pkg = join(dir, 'package.json');
    if (existsSync(pkg)) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}

const root = findNearestPackageJsonRoot(startDir);
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
