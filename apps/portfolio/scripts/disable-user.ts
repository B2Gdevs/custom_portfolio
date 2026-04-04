/**
 * Disable a user account and revoke all their outstanding invites.
 *
 *   pnpm auth:disable-user -- --email=a@b.com
 *
 * Disabled users cannot log in. Existing sessions remain valid until they expire.
 * Use the admin UI to re-enable an account.
 */
import { AUTH_COLLECTION_SLUG } from '@/lib/auth/config';
import { revokeInvitesByEmail } from '@/lib/auth/invite';
import { getPayloadClient } from '@/lib/payload';
import { loadScriptEnv } from './load-script-env';

loadScriptEnv();

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

async function main() {
  const email = arg('email')?.trim();

  if (!email) {
    console.error('Usage: pnpm auth:disable-user -- --email=user@host');
    process.exit(1);
  }

  const payload = await getPayloadClient();

  const existing = await payload.find({
    collection: AUTH_COLLECTION_SLUG,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { email: { equals: email } },
  });

  const user = existing.docs[0] as { id: string | number; role?: string } | undefined;

  if (!user) {
    console.error(`[auth:disable-user] no user found with email "${email}"`);
    process.exit(1);
  }

  if (user.role === 'owner') {
    console.error('[auth:disable-user] cannot disable the owner account via CLI');
    process.exit(1);
  }

  await payload.update({
    collection: AUTH_COLLECTION_SLUG,
    id: String(user.id),
    overrideAccess: true,
    data: { disabled: true },
  });

  const revokedCount = await revokeInvitesByEmail(email);

  const parts = [`disabled ${email}`];
  if (revokedCount > 0) parts.push(`revoked ${revokedCount} pending invite(s)`);

  console.log(`[auth:disable-user] ${parts.join(', ')}`);
  process.exit(0);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[auth:disable-user] failed: ${message}`);
  process.exit(1);
});
