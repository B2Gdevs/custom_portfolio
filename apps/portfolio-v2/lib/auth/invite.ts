import { createHash, randomBytes } from 'node:crypto';
import type { Where } from 'payload';
import type { AuthEntitlement } from '@/lib/auth/config';

export const INVITE_COLLECTION_SLUG = 'inviteTokens';
export const INVITE_TOKEN_EXPIRY_HOURS = 72;

export type InviteRole = 'admin' | 'member';

export function generateInviteToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashInviteToken(plaintext: string): string {
  return createHash('sha256').update(plaintext, 'utf8').digest('hex');
}

export function inviteExpiresAt(fromDate = new Date()): Date {
  const d = new Date(fromDate);
  d.setHours(d.getHours() + INVITE_TOKEN_EXPIRY_HOURS);
  return d;
}

export type InviteRecord = {
  id: string;
  email: string;
  role: InviteRole;
  tenant: { id: string; slug: string | null; name: string | null } | string;
  tokenHash: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
};

export type CreateInviteResult = {
  plaintext: string;
  record: InviteRecord;
};

export type VerifyInviteResult =
  | { valid: true; record: InviteRecord }
  | { valid: false; reason: 'not_found' | 'expired' | 'already_used' | 'revoked' };

/**
 * Create a new invite token record. Returns the plaintext token (one-time, not stored).
 */
export async function createInviteToken(params: {
  email: string;
  tenantId: string | number;
  role: InviteRole;
  createdById?: string | number;
}): Promise<CreateInviteResult> {
  const { getPayloadClient } = await import('@/lib/payload');
  const payload = await getPayloadClient();

  const plaintext = generateInviteToken();
  const tokenHash = hashInviteToken(plaintext);
  const expiresAt = inviteExpiresAt();

  const record = await payload.create({
    collection: INVITE_COLLECTION_SLUG,
    overrideAccess: true,
    data: {
      email: params.email.toLowerCase().trim(),
      tenant: params.tenantId,
      role: params.role,
      tokenHash,
      expiresAt: expiresAt.toISOString(),
      ...(params.createdById != null ? { createdBy: params.createdById } : {}),
    },
  });

  return { plaintext, record: record as unknown as InviteRecord };
}

/**
 * Look up and validate a plaintext invite token.
 */
export async function verifyInviteToken(plaintext: string): Promise<VerifyInviteResult> {
  const { getPayloadClient } = await import('@/lib/payload');
  const payload = await getPayloadClient();

  const hash = hashInviteToken(plaintext);
  const result = await payload.find({
    collection: INVITE_COLLECTION_SLUG,
    overrideAccess: true,
    pagination: false,
    limit: 1,
    where: { tokenHash: { equals: hash } },
  });

  const record = result.docs[0] as unknown as InviteRecord | undefined;
  if (!record) return { valid: false, reason: 'not_found' };
  if (record.revokedAt) return { valid: false, reason: 'revoked' };
  if (record.acceptedAt) return { valid: false, reason: 'already_used' };
  if (new Date(record.expiresAt) < new Date()) return { valid: false, reason: 'expired' };

  return { valid: true, record };
}

/**
 * Mark an invite as accepted (consumed). Call after successfully creating the user.
 */
export async function consumeInviteToken(tokenId: string): Promise<void> {
  const { getPayloadClient } = await import('@/lib/payload');
  const payload = await getPayloadClient();

  await payload.update({
    collection: INVITE_COLLECTION_SLUG,
    id: tokenId,
    overrideAccess: true,
    data: { acceptedAt: new Date().toISOString() },
  });
}

/**
 * Revoke all pending (un-accepted) invites for an email, optionally scoped to a tenant.
 */
export async function revokeInvitesByEmail(
  email: string,
  tenantId?: string | number,
): Promise<number> {
  const { getPayloadClient } = await import('@/lib/payload');
  const payload = await getPayloadClient();

  const where: Where = {
    email: { equals: email.toLowerCase().trim() },
    acceptedAt: { exists: false },
    revokedAt: { exists: false },
  };

  if (tenantId != null) {
    where.tenant = { equals: tenantId };
  }

  const result = await payload.find({
    collection: INVITE_COLLECTION_SLUG,
    overrideAccess: true,
    pagination: false,
    limit: 100,
    where,
  });

  const now = new Date().toISOString();
  await Promise.all(
    result.docs.map((doc) =>
      payload.update({
        collection: INVITE_COLLECTION_SLUG,
        id: String((doc as { id: string | number }).id),
        overrideAccess: true,
        data: { revokedAt: now },
      }),
    ),
  );

  return result.docs.length;
}

export type InviteRejectReason = 'not_found' | 'expired' | 'already_used' | 'revoked';

export type AcceptInviteResult =
  | { ok: false; reason: InviteRejectReason }
  | { ok: true; email: string; role: InviteRole };

/**
 * Accept an invite: find-or-create the user account, set password, consume the token.
 */
export async function acceptInvite(params: {
  plaintext: string;
  password: string;
  displayName?: string;
}): Promise<AcceptInviteResult> {
  const { getPayloadClient } = await import('@/lib/payload');
  const { AUTH_COLLECTION_SLUG, OWNER_DEFAULT_ENTITLEMENTS } = await import('@/lib/auth/config');

  const verification = await verifyInviteToken(params.plaintext);
  if (!verification.valid) {
    return { ok: false, reason: verification.reason };
  }

  const payload = await getPayloadClient();
  const { record } = verification;
  const tenantId =
    typeof record.tenant === 'object' ? record.tenant.id : record.tenant;
  const email = record.email;
  const role = record.role;
  const entitlements: AuthEntitlement[] = role === 'admin' ? [...OWNER_DEFAULT_ENTITLEMENTS] : [];

  const existing = await payload.find({
    collection: AUTH_COLLECTION_SLUG,
    overrideAccess: true,
    pagination: false,
    limit: 1,
    where: { email: { equals: email } },
  });

  if (existing.docs[0]) {
    const id = String((existing.docs[0] as { id: string | number }).id);
    await payload.update({
      collection: AUTH_COLLECTION_SLUG,
      id,
      overrideAccess: true,
      data: {
        password: params.password,
        role,
        tenant: tenantId,
        entitlements,
        disabled: false,
        ...(params.displayName ? { displayName: params.displayName } : {}),
      },
    });
  } else {
    await payload.create({
      collection: AUTH_COLLECTION_SLUG,
      overrideAccess: true,
      data: {
        email,
        password: params.password,
        role,
        tenant: tenantId,
        entitlements,
        disabled: false,
        ...(params.displayName ? { displayName: params.displayName } : {}),
      },
    });
  }

  await consumeInviteToken(record.id);

  return { ok: true, email, role };
}
