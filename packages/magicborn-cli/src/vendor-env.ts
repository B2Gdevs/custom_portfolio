import fs from 'node:fs';
import path from 'node:path';

/**
 * Minimal `.env` reader for vendor child processes (no dotenv dependency).
 * Values are not expanded or unquoted beyond simple optional surrounding quotes.
 */
export function loadVendorDotEnv(vendorRoot: string): Record<string, string> {
  const p = path.join(vendorRoot, '.env');
  if (!fs.existsSync(p)) {
    return {};
  }
  const text = fs.readFileSync(p, 'utf8');
  const out: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) {
      continue;
    }
    const eq = t.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const k = t.slice(0, eq).trim();
    if (!k || k.includes(' ')) {
      continue;
    }
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"') && v.length >= 2) ||
      (v.startsWith("'") && v.endsWith("'") && v.length >= 2)
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}
