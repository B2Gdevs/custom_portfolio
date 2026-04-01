import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  VENDOR_CLI_FRAMEWORK_ID,
  VENDOR_CLI_MANIFEST_LEGACY_JSON_RELPATH,
  discoverVendorProfiles,
  loadVendorRegistry,
} from '../src/vendor-registry.ts';

function writeJson(p: string, v: unknown) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(v), 'utf8');
}

function writeTomlManifest(pkgRoot: string, body: string) {
  const p = path.join(pkgRoot, '.magicborn', 'cli.toml');
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body.trimStart(), 'utf8');
}

describe('discoverVendorProfiles', () => {
  it('registers packages with .magicborn/cli.toml under vendor/', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-vnd-'));
    writeJson(path.join(tmp, 'pnpm-workspace.yaml'), { packages: [] });
    writeTomlManifest(
      path.join(tmp, 'vendor', 'acme'),
      `
framework = "${VENDOR_CLI_FRAMEWORK_ID}"
id = "acme"
bin = "bin/acme.mjs"
description = "Acme test"
`,
    );

    const found = discoverVendorProfiles(tmp, ['vendor']);
    expect(found.acme).toEqual({
      path: 'vendor/acme',
      bin: path.join('bin', 'acme.mjs'),
      description: 'Acme test',
    });
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('still registers legacy .magicborn/cli.json when cli.toml is absent', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-vnd-legacy-json-'));
    writeJson(path.join(tmp, 'pnpm-workspace.yaml'), {});
    const pkg = path.join(tmp, 'vendor', 'oldpkg');
    fs.mkdirSync(path.join(pkg, '.magicborn'), { recursive: true });
    writeJson(path.join(pkg, VENDOR_CLI_MANIFEST_LEGACY_JSON_RELPATH), {
      framework: VENDOR_CLI_FRAMEWORK_ID,
      id: 'oldpkg',
      bin: 'bin/old.mjs',
    });

    const found = discoverVendorProfiles(tmp, ['vendor']);
    expect(found.oldpkg?.path).toBe('vendor/oldpkg');
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('ignores manifests with wrong framework id', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-vnd-fw-'));
    writeJson(path.join(tmp, 'pnpm-workspace.yaml'), {});
    writeTomlManifest(
      path.join(tmp, 'vendor', 'x'),
      `
framework = "other-cli"
id = "x"
bin = "bin/x.mjs"
`,
    );

    expect(Object.keys(discoverVendorProfiles(tmp, ['vendor']))).toEqual([]);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('allows omitting framework (treated as compatible)', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-vnd-nofw-'));
    writeJson(path.join(tmp, 'pnpm-workspace.yaml'), {});
    writeTomlManifest(
      path.join(tmp, 'vendor', 'legacy'),
      `
id = "legacy"
bin = "cli.mjs"
`,
    );

    const found = discoverVendorProfiles(tmp, ['vendor']);
    expect(found.legacy).toEqual({ path: 'vendor/legacy', bin: 'cli.mjs' });
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});

describe('loadVendorRegistry', () => {
  it('merges defaults, discovery, and vendors.json overrides', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-vnd-merge-'));
    writeJson(path.join(tmp, 'pnpm-workspace.yaml'), {});
    writeTomlManifest(
      path.join(tmp, 'vendor', 'acme'),
      `
framework = "${VENDOR_CLI_FRAMEWORK_ID}"
id = "acme"
bin = "bin/a.mjs"
`,
    );
    fs.mkdirSync(path.join(tmp, '.magicborn'), { recursive: true });
    writeJson(path.join(tmp, '.magicborn', 'vendors.json'), {
      vendors: {
        acme: { path: 'vendor/acme', bin: 'bin/override.mjs' },
      },
    });

    const reg = loadVendorRegistry(tmp);
    expect(reg.vendors.acme?.bin).toBe('bin/override.mjs');
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
