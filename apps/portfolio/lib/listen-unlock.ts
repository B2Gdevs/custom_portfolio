import { createHash, timingSafeEqual } from 'node:crypto';

export function parseListenLockGroups(): Record<string, string> {
  const raw = process.env.LISTEN_LOCK_GROUPS?.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof k === 'string' && typeof v === 'string' && k.length > 0) {
        out[k] = v;
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** Cookie name for a lock group slug (alphanumeric, hyphen, underscore). */
export function listenGroupCookieName(group: string): string {
  const safe = group.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `listen_unlock_${safe}`;
}

function hashPasswordAttempt(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

export function verifyListenGroupPassword(group: string, password: string): boolean {
  const map = parseListenLockGroups();
  const expected = map[group];
  if (expected === undefined || expected === '') return false;
  const trimmed = password.trim();
  if (!trimmed) return false;
  try {
    return timingSafeEqual(hashPasswordAttempt(trimmed), hashPasswordAttempt(expected));
  } catch {
    return false;
  }
}
