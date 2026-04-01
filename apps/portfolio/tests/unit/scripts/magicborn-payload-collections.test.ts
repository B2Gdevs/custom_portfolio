import { describe, expect, it } from 'vitest';
import { tenants } from '@/lib/payload/collections/tenants';
import { users } from '@/lib/payload/collections/users';

/**
 * Smoke for `magicborn payload collections`: slugs match the collection modules wired in payload.config.
 * Full config import is avoided here — Vitest’s graph can yield an empty `collections` array from `buildConfig`.
 */
describe('payload collection slugs (magicborn payload collections)', () => {
  it('exports slugs for core collections', () => {
    expect(users.slug).toBe('users');
    expect(tenants.slug).toBe('tenants');
  });
});
