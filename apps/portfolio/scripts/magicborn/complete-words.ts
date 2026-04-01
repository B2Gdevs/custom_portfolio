/**
 * One word per line for `magicborn __complete <topic>` (shell tab completion).
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  formatVendorCompletionToken,
  shouldEmitAnsiForCompletion,
} from '@magicborn/mb-cli-framework';
import {
  getRegisteredVendorIds,
  getVendorCompletionRows,
} from '@magicborn/cli/vendor-registry';
import { getAllContentEntries } from '@/lib/content';
import { getBooks } from '@/lib/books';
import { getListenCatalog } from '@/lib/listen-catalog';
import { FALLBACK_SITE_APPS } from '@/lib/site-app-registry';
import { MAGICBORN_SCENE_SEEDS } from '@/lib/magicborn-prompts/scene-seeds';

const TOP_LEVEL = [
  'book',
  'app',
  'project',
  'planning-pack',
  'listen',
  'style',
  'model',
  'openai',
  'chat',
  'payload',
  'pnpm',
  'vendor',
  'completion',
  'shell-init',
  'update',
];

function findMonorepoRoot(start = process.cwd()): string | null {
  let dir = path.resolve(start);
  const { root } = path.parse(dir);
  for (;;) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir || dir === root) {
      return null;
    }
    dir = parent;
  }
}

function getVendorIdsForCompletion(): string[] {
  const repoRoot = findMonorepoRoot();
  if (!repoRoot) {
    return [];
  }
  try {
    return getRegisteredVendorIds(repoRoot);
  } catch {
    return [];
  }
}

/** Tab completion: vendor id, optional green `(cli)` when bin exists (NO_COLOR / MAGICBORN_COMPLETE_ANSI). */
function getVendorSuggestLines(): string[] {
  const repoRoot = findMonorepoRoot();
  if (!repoRoot) {
    return [];
  }
  try {
    const rows = getVendorCompletionRows(repoRoot);
    let ansi = false;
    if (process.env.MAGICBORN_COMPLETE_ANSI === '0') {
      ansi = false;
    } else if (process.env.MAGICBORN_COMPLETE_ANSI === '1') {
      ansi = true;
    } else {
      ansi = shouldEmitAnsiForCompletion();
    }
    return rows.map((r) => formatVendorCompletionToken(r, { ansi }));
  } catch {
    return [];
  }
}

export function getCompleteLines(topic: string): string[] {
  const t = topic.trim();
  switch (t) {
    case 'top':
    case 'top-level':
      return TOP_LEVEL;
    case 'book':
      return ['generate', 'gen', 'scenes'];
    case 'book-scenes':
      return ['list', 'extract'];
    case 'app':
    case 'project':
      return ['list', 'generate', 'gen'];
    case 'planning-pack':
    case 'listen':
      return ['generate', 'gen'];
    case 'vendor':
      return ['add', 'list', 'use', 'clear', 'scope'];
    case 'vendor-ids':
      return getVendorIdsForCompletion();
    case 'vendor-suggest':
      return getVendorSuggestLines();
    case 'payload':
      return ['collections', 'app'];
    case 'payload-app':
      return ['generate', 'gen'];
    case 'style':
      return ['show', 'set', 'clear', 'reset', 'suggest'];
    case 'model':
      return ['get', 'set', 'recommend', 'list', 'config'];
    case 'openai':
      return ['status', 'models', 'projects', 'help'];
    case 'completion':
      return ['bash', 'zsh', 'fish'];
    case 'seed-keys':
      return MAGICBORN_SCENE_SEEDS.map((s) => s.key);
    case 'book-slugs':
      return getBooks().map((b) => b.slug);
    case 'app-ids':
      return FALLBACK_SITE_APPS.map((a) => a.id);
    case 'project-slugs':
      return getAllContentEntries('projects').map((e) => e.slug);
    case 'listen-slugs':
      return getListenCatalog().map((e) => e.slug);
    default:
      return [];
  }
}

export function printCompleteLines(topic: string): void {
  for (const line of getCompleteLines(topic)) {
    console.log(line);
  }
}
