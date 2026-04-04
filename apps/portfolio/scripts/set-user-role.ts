/**
 * Change the role (and entitlements) of an existing user.
 *
 *   pnpm auth:set-role -- --email=a@b.com --role=admin|member
 *
 * Updates the role and resets entitlements to the role default.
 * Cannot demote the owner role; use the admin UI for sensitive escalation.
 */
import {
  AUTH_COLLECTION_SLUG,
  OWNER_DEFAULT_ENTITLEMENTS,
  type AuthEntitlement,
} from '@/lib/auth/config';
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
  const role = arg('role')?.trim() as 'admin' | 'member' | undefined;

  if (!email || !role) {
    console.error('Usage: pnpm auth:set-role -- --email=user@host --role=admin|member');
    process.exit(1);
  }

  if (role !== 'admin' && role !== 'member') {
    console.error('[auth:set-role] role must be admin or member (owner role is not changeable via CLI)');
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
    console.error(`[auth:set-role] no user found with email "${email}"`);
    process.exit(1);
  }

  if (user.role === 'owner') {
    console.error('[auth:set-role] cannot change the role of an owner account via CLI');
    process.exit(1);
  }

  const entitlements: AuthEntitlement[] = role === 'admin' ? [...OWNER_DEFAULT_ENTITLEMENTS] : [];

  await payload.update({
    collection: AUTH_COLLECTION_SLUG,
    id: String(user.id),
    overrideAccess: true,
    data: { role, entitlements },
  });

  console.log(`[auth:set-role] updated ${email} to role "${role}"`);
  process.exit(0);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[auth:set-role] failed: ${message}`);
  process.exit(1);
});
