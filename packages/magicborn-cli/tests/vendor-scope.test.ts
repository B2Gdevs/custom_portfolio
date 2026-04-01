import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  clearVendorScopeFile,
  readVendorScopeFile,
  writeVendorScopeFile,
} from '../src/vendor-scope.ts';

describe('vendor-scope file', () => {
  it('returns null when missing', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-scope-'));
    expect(readVendorScopeFile(tmp)).toBeNull();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('writes, reads, and clears', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-scope-'));
    const scope = { vendorId: 'acme', vendorRoot: path.join(tmp, 'vendor', 'acme') };
    writeVendorScopeFile(tmp, scope);
    expect(readVendorScopeFile(tmp)).toEqual(scope);
    expect(clearVendorScopeFile(tmp)).toBe(true);
    expect(readVendorScopeFile(tmp)).toBeNull();
    expect(clearVendorScopeFile(tmp)).toBe(false);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('returns null when vendorId or vendorRoot empty', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-scope-bad-'));
    fs.mkdirSync(path.join(tmp, '.magicborn'), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, '.magicborn', 'vendor-scope.json'),
      '{"vendorId":"","vendorRoot":"/x"}',
      'utf8',
    );
    expect(readVendorScopeFile(tmp)).toBeNull();
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
