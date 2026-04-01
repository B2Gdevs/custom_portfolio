import fs from 'node:fs';
import path from 'node:path';
import { parse as parseToml } from '@iarna/toml';
import { findRepoRoot } from './repo-root.js';

/** Primary manifest (aligned with repo `.magicborn/cli-config.toml`). */
export const VENDOR_CLI_MANIFEST_RELPATH = path.join('.magicborn', 'cli.toml');

/** Deprecated: use `cli.toml`. Still read if present so older vendor checkouts work. */
export const VENDOR_CLI_MANIFEST_LEGACY_JSON_RELPATH = path.join('.magicborn', 'cli.json');

/** If set in manifest, must match or the package is ignored (room for other `.magicborn` uses). */
export const VENDOR_CLI_FRAMEWORK_ID = 'magicborn-vendor-cli';

export type VendorProfile = {
  /** Repo-relative directory (e.g. vendor/grime-time-site) */
  path: string;
  /** Path to CLI entry, relative to the vendor root */
  bin: string;
  /** Short description for help text */
  description?: string;
};

/** On-disk manifest inside a vendored package (`.magicborn/cli.toml`). */
export type VendorCliManifest = {
  /** When set, only `magicborn-vendor-cli` is auto-registered. */
  framework?: string;
  /** Optional future versioning; ignored for now. */
  version?: number;
  id: string;
  bin: string;
  description?: string;
};

export type VendorDiscoveryConfig = {
  /** When false, only defaults + `vendors.json` `vendors` map apply. Default true. */
  enabled?: boolean;
  /**
   * Repo-relative directories to scan for immediate subfolders containing `.magicborn/cli.toml`.
   * Default: `["vendor"]`.
   */
  roots?: string[];
};

export type VendorRegistryFile = {
  defaultVendor?: string;
  vendors: Record<string, VendorProfile>;
  discovery?: VendorDiscoveryConfig;
};

const DEFAULT_REGISTRY: VendorRegistryFile = {
  defaultVendor: 'grimetime',
  vendors: {
    grimetime: {
      path: 'vendor/grime-time-site',
      bin: 'bin/grimetime.mjs',
      description: 'Grime Time — Payload site (grimetime CLI)',
    },
  },
};

function isPathInsideDir(rootDir: string, targetPath: string): boolean {
  const root = path.resolve(rootDir);
  const target = path.resolve(targetPath);
  const rel = path.relative(root, target);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function safeResolveUnderRoot(repoRoot: string, rel: string): string {
  const resolved = path.resolve(repoRoot, rel);
  const rootNorm = path.resolve(repoRoot);
  if (resolved !== rootNorm && !isPathInsideDir(rootNorm, resolved)) {
    throw new Error(`Path escapes repo root: ${rel}`);
  }
  return resolved;
}

function toRepoRelativePosix(repoRoot: string, absoluteDir: string): string {
  const rel = path.relative(repoRoot, absoluteDir);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Path not under repo root: ${absoluteDir}`);
  }
  return rel.split(path.sep).join('/');
}

function isSafeVendorId(id: string): boolean {
  return /^[a-z][a-z0-9_-]{0,63}$/i.test(id);
}

function isSafeRelativeBin(bin: string): boolean {
  if (!bin.trim()) {
    return false;
  }
  const norm = path.normalize(bin.trim());
  if (path.isAbsolute(norm)) {
    return false;
  }
  const parts = norm.split(path.sep);
  if (parts.includes('..')) {
    return false;
  }
  return true;
}

/** Repo-relative scan root only (e.g. `vendor`), never `.` (would scan the whole monorepo). */
function isSafeDiscoveryRootRel(rel: string): boolean {
  const n = rel.replace(/\\/g, '/').trim();
  if (!n || n === '.' || n === '..') {
    return false;
  }
  if (n.split('/').includes('..')) {
    return false;
  }
  return true;
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Prefer `cli.toml`; fall back to legacy `cli.json`. */
function readVendorPackageManifest(pkgAbs: string): unknown | null {
  const tomlPath = path.join(pkgAbs, VENDOR_CLI_MANIFEST_RELPATH);
  if (fs.existsSync(tomlPath)) {
    try {
      const raw = fs.readFileSync(tomlPath, 'utf8');
      return parseToml(raw) as unknown;
    } catch {
      return null;
    }
  }
  const jsonPath = path.join(pkgAbs, VENDOR_CLI_MANIFEST_LEGACY_JSON_RELPATH);
  if (fs.existsSync(jsonPath)) {
    return readJsonFile<unknown>(jsonPath);
  }
  return null;
}

function parseVendorCliManifest(raw: unknown, debug: boolean): VendorCliManifest | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const fw = o.framework;
  if (fw !== undefined && fw !== null && String(fw) !== VENDOR_CLI_FRAMEWORK_ID) {
    if (debug) {
      console.error(`[magicborn vendor] skip manifest: framework "${String(fw)}" !== ${VENDOR_CLI_FRAMEWORK_ID}`);
    }
    return null;
  }
  const id = typeof o.id === 'string' ? o.id.trim() : '';
  const bin = typeof o.bin === 'string' ? o.bin.trim() : '';
  const description = typeof o.description === 'string' ? o.description : undefined;
  const version = typeof o.version === 'number' ? o.version : undefined;
  if (!isSafeVendorId(id)) {
    if (debug) {
      console.error(`[magicborn vendor] skip manifest: invalid id "${id}"`);
    }
    return null;
  }
  if (!isSafeRelativeBin(bin)) {
    if (debug) {
      console.error(`[magicborn vendor] skip manifest: unsafe bin "${bin}"`);
    }
    return null;
  }
  return {
    framework: fw === undefined || fw === null ? undefined : String(fw),
    version,
    id,
    bin,
    description,
  };
}

/**
 * Scan each root’s immediate subdirectories for `.magicborn/cli.toml` (or legacy `cli.json`).
 * Later roots / lexicographic dir order can override the same `id` (last wins).
 */
export function discoverVendorProfiles(
  repoRoot: string,
  roots: string[],
  options?: { debug?: boolean },
): Record<string, VendorProfile> {
  const debug = options?.debug === true || process.env.MAGICBORN_VENDOR_DEBUG === '1';
  const out: Record<string, VendorProfile> = {};
  const absRepo = path.resolve(repoRoot);

  for (const rootRel of roots) {
    if (!isSafeDiscoveryRootRel(rootRel)) {
      if (debug) {
        console.error(`[magicborn vendor] skip discovery root (unsafe): ${rootRel}`);
      }
      continue;
    }
    const rootAbs = path.resolve(absRepo, rootRel);
    if (!isPathInsideDir(absRepo, rootAbs) && rootAbs !== absRepo) {
      if (debug) {
        console.error(`[magicborn vendor] skip discovery root (outside repo): ${rootRel}`);
      }
      continue;
    }
    if (!fs.existsSync(rootAbs) || !fs.statSync(rootAbs).isDirectory()) {
      continue;
    }
    let names: string[];
    try {
      names = fs.readdirSync(rootAbs);
    } catch {
      continue;
    }
    names.sort();
    for (const name of names) {
      const pkgAbs = path.join(rootAbs, name);
      let st: fs.Stats;
      try {
        st = fs.statSync(pkgAbs);
      } catch {
        continue;
      }
      if (!st.isDirectory()) {
        continue;
      }
      const hasToml = fs.existsSync(path.join(pkgAbs, VENDOR_CLI_MANIFEST_RELPATH));
      const hasLegacyJson = fs.existsSync(path.join(pkgAbs, VENDOR_CLI_MANIFEST_LEGACY_JSON_RELPATH));
      if (!hasToml && !hasLegacyJson) {
        continue;
      }
      const raw = readVendorPackageManifest(pkgAbs);
      const manifest = parseVendorCliManifest(raw, debug);
      if (!manifest) {
        continue;
      }
      const profilePath = toRepoRelativePosix(absRepo, pkgAbs);
      out[manifest.id] = {
        path: profilePath,
        bin: manifest.bin.split('/').join(path.sep),
        description: manifest.description,
      };
    }
  }
  return out;
}

function readVendorsJson(repoRoot: string): Partial<VendorRegistryFile> | null {
  const userPath = path.join(repoRoot, '.magicborn', 'vendors.json');
  if (!fs.existsSync(userPath)) {
    return null;
  }
  const raw = readJsonFile<unknown>(userPath);
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  return raw as Partial<VendorRegistryFile>;
}

export function loadVendorRegistry(repoRoot: string): VendorRegistryFile {
  const user = readVendorsJson(repoRoot);
  const discovery = user?.discovery;
  const enabled = discovery?.enabled !== false;
  const roots =
    Array.isArray(discovery?.roots) && discovery.roots.length > 0
      ? discovery.roots.map((r) => String(r).trim()).filter(Boolean)
      : ['vendor'];

  const discovered = enabled ? discoverVendorProfiles(repoRoot, roots) : {};

  const mergedVendors: Record<string, VendorProfile> = {
    ...DEFAULT_REGISTRY.vendors,
    ...discovered,
    ...(user?.vendors ?? {}),
  };

  const defaultVendor =
    user?.defaultVendor?.trim() ||
    DEFAULT_REGISTRY.defaultVendor ||
    Object.keys(mergedVendors).sort()[0];

  return {
    defaultVendor,
    vendors: mergedVendors,
    discovery: user?.discovery,
  };
}

export function resolveVendorProfile(
  repoRoot: string,
  registry: VendorRegistryFile,
  vendorId: string,
): { id: string; root: string; bin: string; profile: VendorProfile } {
  const profile = registry.vendors[vendorId];
  if (!profile) {
    const known = Object.keys(registry.vendors).join(', ');
    throw new Error(`Unknown vendor id "${vendorId}". Known: ${known || '(none)'}`);
  }
  const root = safeResolveUnderRoot(repoRoot, profile.path);
  if (!fs.existsSync(root)) {
    throw new Error(`Vendor path missing: ${profile.path} (vendor "${vendorId}")`);
  }
  const bin = safeResolveUnderRoot(root, profile.bin);
  if (!fs.existsSync(bin)) {
    throw new Error(`Vendor CLI not found at ${bin} (vendor "${vendorId}"). Run pnpm install in that package.`);
  }
  return { id: vendorId, root, bin, profile };
}

export function getDefaultVendorId(registry: VendorRegistryFile): string {
  const fromEnv = process.env.MAGICBORN_VENDOR_ID?.trim();
  if (fromEnv && registry.vendors[fromEnv]) {
    return fromEnv;
  }
  const d = registry.defaultVendor?.trim();
  if (d && registry.vendors[d]) {
    return d;
  }
  const first = Object.keys(registry.vendors).sort()[0];
  if (!first) {
    throw new Error(
      'No vendors registered. Add vendor packages with .magicborn/cli.toml, or .magicborn/vendors.json.',
    );
  }
  return first;
}

export function findRepoRootForVendor(): string {
  return findRepoRoot();
}

/** Stable sorted ids for shell completion (`magicborn __complete vendor-ids`). */
export function getRegisteredVendorIds(repoRoot: string): string[] {
  return Object.keys(loadVendorRegistry(repoRoot).vendors).sort();
}
