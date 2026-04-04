import { createHash } from 'node:crypto';
import {
  generateInviteToken,
  hashInviteToken,
  inviteExpiresAt,
  INVITE_TOKEN_EXPIRY_HOURS,
  type InviteRecord,
} from '@/lib/auth/invite';

// ---------------------------------------------------------------------------
// Pure helpers (no DB / Payload)
// ---------------------------------------------------------------------------

describe('generateInviteToken', () => {
  it('produces a non-empty string', () => {
    const token = generateInviteToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  it('produces unique tokens on each call', () => {
    const a = generateInviteToken();
    const b = generateInviteToken();
    expect(a).not.toBe(b);
  });

  it('contains only URL-safe base64 characters', () => {
    const token = generateInviteToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe('hashInviteToken', () => {
  it('returns a SHA-256 hex string', () => {
    const hash = hashInviteToken('test-token');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic for the same input', () => {
    expect(hashInviteToken('abc')).toBe(hashInviteToken('abc'));
  });

  it('differs for different inputs', () => {
    expect(hashInviteToken('abc')).not.toBe(hashInviteToken('xyz'));
  });

  it('matches a manual SHA-256 computation', () => {
    const plaintext = 'known-token';
    const expected = createHash('sha256').update(plaintext, 'utf8').digest('hex');
    expect(hashInviteToken(plaintext)).toBe(expected);
  });
});

describe('inviteExpiresAt', () => {
  it('is exactly INVITE_TOKEN_EXPIRY_HOURS hours in the future', () => {
    const base = new Date('2026-01-01T00:00:00Z');
    const expiry = inviteExpiresAt(base);
    const diffHours = (expiry.getTime() - base.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBe(INVITE_TOKEN_EXPIRY_HOURS);
  });

  it('defaults to now when no base date is provided', () => {
    const before = Date.now();
    const expiry = inviteExpiresAt();
    const after = Date.now();
    const expectedMs = INVITE_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
    expect(expiry.getTime()).toBeGreaterThanOrEqual(before + expectedMs - 100);
    expect(expiry.getTime()).toBeLessThanOrEqual(after + expectedMs + 100);
  });
});

// ---------------------------------------------------------------------------
// verifyInviteToken — logic branch tests (mocked Payload)
// ---------------------------------------------------------------------------

vi.mock('@/lib/payload', () => ({
  getPayloadClient: vi.fn(),
}));

import { getPayloadClient } from '@/lib/payload';
import { verifyInviteToken, consumeInviteToken, revokeInvitesByEmail } from '@/lib/auth/invite';

type MockPayload = {
  find: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
};

function makeRecord(overrides: Partial<InviteRecord> = {}): InviteRecord {
  return {
    id: 'rec-1',
    email: 'user@example.com',
    role: 'member',
    tenant: { id: 'ten-1', slug: 'acme', name: 'Acme' },
    tokenHash: hashInviteToken('valid-token'),
    expiresAt: inviteExpiresAt().toISOString(),
    acceptedAt: null,
    revokedAt: null,
    ...overrides,
  };
}

function makePayload(record: InviteRecord | undefined): MockPayload {
  return {
    find: vi.fn().mockResolvedValue({ docs: record ? [record] : [] }),
    update: vi.fn().mockResolvedValue({}),
    create: vi.fn().mockResolvedValue(record ?? {}),
  };
}

describe('verifyInviteToken', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns not_found when no record exists for the hash', async () => {
    vi.mocked(getPayloadClient).mockResolvedValue(makePayload(undefined) as never);

    const result = await verifyInviteToken('unknown-token');

    expect(result).toEqual({ valid: false, reason: 'not_found' });
  });

  it('returns revoked when revokedAt is set', async () => {
    const record = makeRecord({ revokedAt: new Date().toISOString() });
    vi.mocked(getPayloadClient).mockResolvedValue(makePayload(record) as never);

    const result = await verifyInviteToken('valid-token');

    expect(result).toEqual({ valid: false, reason: 'revoked' });
  });

  it('returns already_used when acceptedAt is set', async () => {
    const record = makeRecord({ acceptedAt: new Date().toISOString() });
    vi.mocked(getPayloadClient).mockResolvedValue(makePayload(record) as never);

    const result = await verifyInviteToken('valid-token');

    expect(result).toEqual({ valid: false, reason: 'already_used' });
  });

  it('returns expired when expiresAt is in the past', async () => {
    const record = makeRecord({ expiresAt: new Date(Date.now() - 1000).toISOString() });
    vi.mocked(getPayloadClient).mockResolvedValue(makePayload(record) as never);

    const result = await verifyInviteToken('valid-token');

    expect(result).toEqual({ valid: false, reason: 'expired' });
  });

  it('returns valid with the record for a clean, unexpired invite', async () => {
    const record = makeRecord();
    vi.mocked(getPayloadClient).mockResolvedValue(makePayload(record) as never);

    const result = await verifyInviteToken('valid-token');

    expect(result).toEqual({ valid: true, record });
  });

  it('queries by the SHA-256 hash of the plaintext token', async () => {
    const mockPayload = makePayload(makeRecord());
    vi.mocked(getPayloadClient).mockResolvedValue(mockPayload as never);

    await verifyInviteToken('valid-token');

    expect(mockPayload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tokenHash: { equals: hashInviteToken('valid-token') } },
      }),
    );
  });
});

describe('consumeInviteToken', () => {
  it('updates the record with acceptedAt set to now', async () => {
    const mockPayload = makePayload(makeRecord());
    vi.mocked(getPayloadClient).mockResolvedValue(mockPayload as never);

    await consumeInviteToken('rec-1');

    expect(mockPayload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'rec-1',
        data: expect.objectContaining({ acceptedAt: expect.any(String) }),
      }),
    );
  });
});

describe('revokeInvitesByEmail', () => {
  it('returns 0 when no pending invites exist', async () => {
    const mockPayload = makePayload(undefined);
    vi.mocked(getPayloadClient).mockResolvedValue(mockPayload as never);

    const count = await revokeInvitesByEmail('nobody@example.com');

    expect(count).toBe(0);
    expect(mockPayload.update).not.toHaveBeenCalled();
  });

  it('revokes all found records and returns the count', async () => {
    const records = [makeRecord({ id: 'r1' }), makeRecord({ id: 'r2' })];
    const mockPayload = {
      find: vi.fn().mockResolvedValue({ docs: records }),
      update: vi.fn().mockResolvedValue({}),
    };
    vi.mocked(getPayloadClient).mockResolvedValue(mockPayload as never);

    const count = await revokeInvitesByEmail('user@example.com');

    expect(count).toBe(2);
    expect(mockPayload.update).toHaveBeenCalledTimes(2);
    for (const call of mockPayload.update.mock.calls as Array<[{ data: { revokedAt: string } }]>) {
      expect(call[0].data.revokedAt).toBeTruthy();
    }
  });

  it('scopes the query to the given tenant when provided', async () => {
    const mockPayload = makePayload(undefined);
    vi.mocked(getPayloadClient).mockResolvedValue(mockPayload as never);

    await revokeInvitesByEmail('user@example.com', 'ten-99');

    expect(mockPayload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenant: { equals: 'ten-99' } }),
      }),
    );
  });
});
