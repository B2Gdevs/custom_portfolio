import { spawnSync } from 'node:child_process';
import {
  findRepoRootForVendor,
  getDefaultVendorId,
  getVendorCompletionRows,
  loadVendorRegistry,
  resolveVendorProfile,
} from './vendor-registry.js';
import { loadVendorDotEnv } from './vendor-env.js';
import {
  clearVendorScopeFile,
  readVendorScopeFile,
  writeVendorScopeFile,
} from './vendor-scope.js';

/** @deprecated Top-level forwards (use `magicborn vendor <id> <cmd> …`). */
export const VENDOR_TOPIC_COMMANDS = ['users', 'org', 'tenant', 'blog'] as const;

const VENDOR_LEADING_RESERVED = new Set(['list', 'use', 'clear', 'scope', 'add']);

/**
 * If argv starts with a registered vendor id, treat it as `magicborn vendor <id> …`.
 * Does not consume `list|use|clear|scope|add`.
 */
export function stripLeadingVendorId(
  vendorIds: Record<string, unknown>,
  argv: string[],
): { explicitVendorId: string | null; rest: string[] } {
  if (argv.length === 0) {
    return { explicitVendorId: null, rest: argv };
  }
  const first = argv[0] ?? '';
  if (VENDOR_LEADING_RESERVED.has(first)) {
    return { explicitVendorId: null, rest: argv };
  }
  if (vendorIds[first]) {
    return { explicitVendorId: first, rest: argv.slice(1) };
  }
  return { explicitVendorId: null, rest: argv };
}

export type ParsedVendorArgs = {
  vendorId: string | null;
  forwarded: string[];
};

/**
 * Parse `--id <id>` / `--id=<id>` / `-i <id>` from argv; remainder is forwarded to vendor CLI.
 */
export function parseVendorForwardArgs(argv: string[]): ParsedVendorArgs {
  const forwarded: string[] = [];
  let vendorId: string | null = null;
  let i = 0;
  while (i < argv.length) {
    const a = argv[i] ?? '';
    if (a === '--id' || a === '-i') {
      const v = argv[i + 1]?.trim();
      if (!v) {
        throw new Error(`${a} requires a vendor id (e.g. grimetime)`);
      }
      vendorId = v;
      i += 2;
      continue;
    }
    if (a.startsWith('--id=')) {
      vendorId = a.slice('--id='.length).trim() || null;
      if (!vendorId) {
        throw new Error('--id= requires a non-empty vendor id');
      }
      i += 1;
      continue;
    }
    forwarded.push(a);
    i += 1;
  }
  return { vendorId, forwarded };
}

export function printVendorCliHelp(): void {
  console.log(`Usage:
  magicborn vendor list [--json]            Human table (default); --json for full registry
  magicborn vendor <id> [args...]          Run vendor CLI (cwd = vendor package root); id = registered vendor
  magicborn vendor --id <id> [args...]     Same, explicit id flag
  magicborn vendor use <id> [--export]      Set default vendor (.magicborn/vendor-scope.json)
  magicborn vendor clear [--export]         Remove vendor scope file
  magicborn vendor scope [--json]           Show env + scope + effective default vendor
  magicborn vendor add <url>                Add a git submodule (Commander)

Environment:
  MAGICBORN_VENDOR_ID   Overrides scope file (highest precedence for default vendor)
  MAGICBORN_VENDOR_ROOT Optional hint (set by vendor use --export)

Scope:
  eval "$(magicborn vendor use <id> --export)"   Apply in current shell
  magicborn vendor clear && eval "$(magicborn vendor clear --export)"   Clear

Registry:
  .magicborn/vendors.json       Optional overlay; merges discovered + defaults.
  vendor/<pkg>/.magicborn/cli.toml  Magicborn vendor CLI manifest (auto-discovery; legacy cli.json still read)

Completion:
  Tab after vendor: ids + list/use/clear/scope/add; (cli) suffix when bin exists (see magicborn completion bash).

Examples:
  magicborn vendor grimetime doctor
  magicborn vendor grimetime users --help
  magicborn vendor --id grimetime seed
  eval "$(magicborn vendor use grimetime --export)"

Vendor env:
  vendor/<id>/.env is merged over the parent process env for nested CLI runs (vendor wins on key collision).

Deprecated (still works, stderr warning):
  magicborn users …   → use: magicborn vendor <default-id> users …
`);
}

function runVendorUse(
  repoRoot: string,
  registry: ReturnType<typeof loadVendorRegistry>,
  args: string[],
): number {
  const exportMode = args.includes('--export');
  const idArg = args.find((a) => a !== '--export' && !a.startsWith('-'));
  if (!idArg) {
    console.error('Usage: magicborn vendor use <id> [--export]');
    return 1;
  }
  if (!registry.vendors[idArg]) {
    console.error(`Unknown vendor "${idArg}". Try: magicborn vendor list`);
    return 1;
  }
  let root: string;
  try {
    root = resolveVendorProfile(repoRoot, registry, idArg).root;
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    return 1;
  }
  writeVendorScopeFile(repoRoot, { vendorId: idArg, vendorRoot: root });
  if (exportMode) {
    console.log(`export MAGICBORN_VENDOR_ID=${JSON.stringify(idArg)}`);
    console.log(`export MAGICBORN_VENDOR_ROOT=${JSON.stringify(root)}`);
  } else {
    console.error(`Vendor scope set: ${idArg}`);
    console.error(`Package root: ${root}`);
    console.error(`This shell: eval "$(magicborn vendor use ${idArg} --export)"`);
    console.error(`Clear: magicborn vendor clear`);
  }
  return 0;
}

function runVendorClear(repoRoot: string, args: string[]): number {
  const exportMode = args.includes('--export');
  const gone = clearVendorScopeFile(repoRoot);
  if (exportMode) {
    console.log('unset MAGICBORN_VENDOR_ID');
    console.log('unset MAGICBORN_VENDOR_ROOT');
  } else {
    console.error(
      gone
        ? 'Vendor scope cleared (.magicborn/vendor-scope.json removed).'
        : 'No vendor scope file was set.',
    );
    if (gone) {
      console.error(`Shell: eval "$(magicborn vendor clear --export)"`);
    }
  }
  return 0;
}

function runVendorScope(
  repoRoot: string,
  registry: ReturnType<typeof loadVendorRegistry>,
  wantJson: boolean,
): number {
  const envId = process.env.MAGICBORN_VENDOR_ID?.trim() || null;
  const envRoot = process.env.MAGICBORN_VENDOR_ROOT?.trim() || null;
  const file = readVendorScopeFile(repoRoot);
  let effective: string;
  try {
    effective = getDefaultVendorId(registry, repoRoot);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    return 1;
  }
  if (wantJson) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          env: { MAGICBORN_VENDOR_ID: envId, MAGICBORN_VENDOR_ROOT: envRoot },
          scopeFile: file,
          effectiveDefaultVendor: effective,
        },
        null,
        2,
      ),
    );
    return 0;
  }
  console.log(`MAGICBORN_VENDOR_ID (env):    ${envId ?? '(unset)'}`);
  console.log(`MAGICBORN_VENDOR_ROOT (env): ${envRoot ?? '(unset)'}`);
  console.log(`Scope file:                   ${file ? `${file.vendorId} → ${file.vendorRoot}` : '(none)'}`);
  console.log(`Effective default vendor:     ${effective}`);
  return 0;
}

/**
 * Run vendor CLI: `node <bin> ...forwarded` with cwd = vendor root.
 */
export function runVendorForward(argv: string[]): number {
  const repoRoot = findRepoRootForVendor();
  const registry = loadVendorRegistry(repoRoot);

  if (argv[0] === 'list') {
    const def = getDefaultVendorId(registry, repoRoot);
    const wantJson = argv.includes('--json');
    if (wantJson) {
      console.log(JSON.stringify({ ok: true, defaultVendor: def, vendors: registry.vendors }, null, 2));
      return 0;
    }
    const rows = getVendorCompletionRows(repoRoot).sort((a, b) => a.id.localeCompare(b.id));
    console.log('Registered vendors  (tab: magicborn vendor use <TAB> · plain ids for shell completion)');
    console.log(`Default: ${def}`);
    console.log('');
    console.log(`${'ID'.padEnd(22)} ${'CLI'.padEnd(10)} note`);
    for (const r of rows) {
      const cli = r.controllable ? 'yes' : 'no';
      const note = r.id === def ? '(default)' : '';
      console.log(`${r.id.padEnd(22)} ${cli.padEnd(10)} ${note}`.trimEnd());
    }
    console.log('');
    console.log('Registry JSON: magicborn vendor list --json');
    return 0;
  }

  if (argv[0] === 'use') {
    return runVendorUse(repoRoot, registry, argv.slice(1));
  }

  if (argv[0] === 'clear') {
    return runVendorClear(repoRoot, argv.slice(1));
  }

  if (argv[0] === 'scope') {
    const wantJson = argv.includes('--json');
    return runVendorScope(repoRoot, registry, wantJson);
  }

  const { explicitVendorId, rest } = stripLeadingVendorId(registry.vendors, argv);
  const parsed = parseVendorForwardArgs(rest);
  let vendorId = parsed.vendorId ?? explicitVendorId ?? getDefaultVendorId(registry, repoRoot);
  const forwarded = parsed.forwarded;

  const { root, bin } = resolveVendorProfile(repoRoot, registry, vendorId);
  const vendorEnv = loadVendorDotEnv(root);

  const result = spawnSync(process.execPath, [bin, ...forwarded], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...vendorEnv,
      MAGICBORN_VENDOR_ID: vendorId,
      MAGICBORN_VENDOR_ROOT: root,
    },
  });
  return result.status ?? 1;
}
