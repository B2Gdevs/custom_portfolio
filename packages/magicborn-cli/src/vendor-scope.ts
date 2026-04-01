import fs from 'node:fs';
import path from 'node:path';

const SCOPE_BASENAME = 'vendor-scope.json';

export type VendorScopeFile = {
  vendorId: string;
  /** Absolute path to vendor package root */
  vendorRoot: string;
};

function scopePath(repoRoot: string): string {
  return path.join(repoRoot, '.magicborn', SCOPE_BASENAME);
}

export function readVendorScopeFile(repoRoot: string): VendorScopeFile | null {
  const p = scopePath(repoRoot);
  if (!fs.existsSync(p)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const j = JSON.parse(raw) as Partial<VendorScopeFile>;
    const vendorId = typeof j.vendorId === 'string' ? j.vendorId.trim() : '';
    const vendorRoot = typeof j.vendorRoot === 'string' ? j.vendorRoot.trim() : '';
    if (!vendorId || !vendorRoot) {
      return null;
    }
    return { vendorId, vendorRoot };
  } catch {
    return null;
  }
}

export function writeVendorScopeFile(repoRoot: string, scope: VendorScopeFile): void {
  const p = scopePath(repoRoot);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(scope, null, 2)}\n`, 'utf8');
}

export function clearVendorScopeFile(repoRoot: string): boolean {
  const p = scopePath(repoRoot);
  if (!fs.existsSync(p)) {
    return false;
  }
  fs.unlinkSync(p);
  return true;
}
