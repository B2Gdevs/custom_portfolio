import fs from 'node:fs';
import path from 'node:path';
import { loadVendorDotEnv } from './vendor-env.js';
import { readVendorScopeFile } from './vendor-scope.js';
import {
  getDefaultVendorId,
  loadVendorRegistry,
  resolveVendorProfile,
} from './vendor-registry.js';

/** Same sensitivity rules as typical CI logs. */
export function redactEnvDisplayValue(key: string, value: string): string {
  const k = key.toUpperCase();
  if (
    /SECRET|PASSWORD|TOKEN|PRIVATE|BEARER|CREDENTIAL|AUTH|API_KEY|_KEY$|KEY_ID|ACCESS_KEY/i.test(
      k,
    )
  ) {
    if (value.length <= 4) return '(redacted)';
    return `(redacted …${value.slice(-4)})`;
  }
  if (value.length > 120) {
    return `${value.slice(0, 60)}… (${value.length} chars)`;
  }
  return value;
}

export type MagicbornEnvJson = {
  ok: boolean;
  repoRoot: string;
  scopeFile: { vendorId: string; vendorRoot: string } | null;
  processMagicbornVendor: { id: string | null; root: string | null };
  effectiveVendorId: string;
  vendorRoot: string;
  vendorBin: string;
  vendorDotEnvPath: string;
  vendorDotEnv: Record<string, string>;
  note: string;
};

/**
 * Print the same vendor resolution + `.env` merge `runVendorForward` uses for nested CLIs.
 * Portfolio forwards (`book`, `payload`, …) load `apps/portfolio/.env` separately — not included here.
 */
export function runMagicbornEnv(repoRoot: string, opts: { json?: boolean }): number {
  const registry = loadVendorRegistry(repoRoot);
  let effectiveVendorId: string;
  try {
    effectiveVendorId = getDefaultVendorId(registry, repoRoot);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: 'no_default_vendor', message: msg }, null, 2));
    } else {
      console.error(msg);
    }
    return 1;
  }

  const resolved = resolveVendorProfile(repoRoot, registry, effectiveVendorId);
  const vendorEnv = loadVendorDotEnv(resolved.root);
  const dotEnvPath = path.join(resolved.root, '.env');
  const scopeFile = readVendorScopeFile(repoRoot);
  const procId = process.env.MAGICBORN_VENDOR_ID?.trim() || null;
  const procRoot = process.env.MAGICBORN_VENDOR_ROOT?.trim() || null;

  const vendorDotEnvRedacted: Record<string, string> = {};
  for (const [k, v] of Object.entries(vendorEnv)) {
    vendorDotEnvRedacted[k] = redactEnvDisplayValue(k, v);
  }

  const note =
    'Nested vendor CLI env: parent process.env ⊕ vendor .env (vendor wins on key collision) ⊕ MAGICBORN_VENDOR_ID / MAGICBORN_VENDOR_ROOT. Portfolio commands (`book`, `payload`, …) use apps/portfolio/.env via loadMagicbornEnv — not this merge.';

  if (opts.json) {
    const payload: MagicbornEnvJson = {
      ok: true,
      repoRoot,
      scopeFile,
      processMagicbornVendor: { id: procId, root: procRoot },
      effectiveVendorId,
      vendorRoot: resolved.root,
      vendorBin: resolved.bin,
      vendorDotEnvPath: dotEnvPath,
      vendorDotEnv: vendorDotEnvRedacted,
      note,
    };
    console.log(JSON.stringify(payload, null, 2));
    return 0;
  }

  console.log('magicborn env — effective vendor scope (same merge as `magicborn vendor <id> …`)');
  console.log('');
  console.log(`Repo root:              ${repoRoot}`);
  console.log(`Scope file:             ${scopeFile ? `${scopeFile.vendorId} → ${scopeFile.vendorRoot}` : '(none)'}`);
  console.log(`MAGICBORN_VENDOR_ID:    ${procId ?? '(unset in this process)'}`);
  console.log(`MAGICBORN_VENDOR_ROOT: ${procRoot ?? '(unset in this process)'}`);
  console.log('');
  console.log(`Effective vendor id:    ${effectiveVendorId}`);
  console.log(`Vendor package root:    ${resolved.root}`);
  console.log(`Vendor CLI bin:         ${resolved.bin}`);
  console.log(`Vendor .env path:       ${fs.existsSync(dotEnvPath) ? dotEnvPath : '(missing file)'}`);
  console.log('');

  const keys = Object.keys(vendorEnv).sort();
  if (keys.length === 0) {
    console.log('Vendor .env keys:       (none loaded)');
  } else {
    console.log(`Vendor .env keys (${keys.length}, values redacted where sensitive):`);
    for (const k of keys) {
      console.log(`  ${k}=${vendorDotEnvRedacted[k]}`);
    }
  }
  console.log('');
  console.log(note);
  return 0;
}
