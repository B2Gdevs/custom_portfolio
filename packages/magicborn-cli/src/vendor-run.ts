import { spawnSync } from 'node:child_process';
import {
  findRepoRootForVendor,
  getDefaultVendorId,
  loadVendorRegistry,
  resolveVendorProfile,
} from './vendor-registry.js';

/** Documented first-class forwards to vendor CLIs (e.g. grimetime users …). */
export const VENDOR_TOPIC_COMMANDS = ['users', 'org', 'tenant', 'blog'] as const;

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
  magicborn vendor --id <id> [args...]     Run a registered vendor CLI (cwd = vendor package root)
  magicborn vendor <users|org|tenant|blog> [args...]
                                            Shorthand: same as --id default + that subcommand
  magicborn vendor list                     List registered vendors
  magicborn vendor add <url>                Add a git submodule (unchanged)

Environment:
  MAGICBORN_VENDOR_ID   Default vendor when --id is omitted (e.g. grimetime)

Registry:
  .magicborn/vendors.json       Optional overlay; merges discovered + defaults.
  vendor/<pkg>/.magicborn/cli.toml  Magicborn vendor CLI manifest (auto-discovery; legacy cli.json still read)

Examples:
  magicborn vendor --id grimetime doctor
  magicborn vendor --id grimetime seed push foundation
  magicborn vendor users --help
`);
}

/**
 * Run vendor CLI: `node <bin> ...forwarded` with cwd = vendor root.
 */
export function runVendorForward(argv: string[]): number {
  const repoRoot = findRepoRootForVendor();
  const registry = loadVendorRegistry(repoRoot);

  if (argv[0] === 'list') {
    const def = getDefaultVendorId(registry);
    console.log(JSON.stringify({ ok: true, defaultVendor: def, vendors: registry.vendors }, null, 2));
    return 0;
  }

  const parsed = parseVendorForwardArgs(argv);
  let vendorId = parsed.vendorId ?? getDefaultVendorId(registry);
  const forwarded = parsed.forwarded;

  const { root, bin } = resolveVendorProfile(repoRoot, registry, vendorId);

  const result = spawnSync(process.execPath, [bin, ...forwarded], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      MAGICBORN_VENDOR_ID: vendorId,
    },
  });
  return result.status ?? 1;
}
