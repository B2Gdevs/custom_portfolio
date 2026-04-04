/**
 * Revoke pending invite(s) for an email address.
 *
 *   pnpm auth:revoke-invite -- --email=a@b.com [--tenant-slug=magicborn-studios]
 *
 * Marks all un-accepted invites for the address as revoked.
 * Scoping by tenant is optional; omit to revoke across all tenants.
 */
import { TENANT_COLLECTION_SLUG } from '@/lib/auth/config';
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
  const tenantSlug = arg('tenant-slug')?.trim();

  if (!email) {
    console.error('Usage: pnpm auth:revoke-invite -- --email=user@host [--tenant-slug=your-tenant]');
    process.exit(1);
  }

  let tenantId: string | undefined;

  if (tenantSlug) {
    const payload = await getPayloadClient();
    const tenantRes = await payload.find({
      collection: TENANT_COLLECTION_SLUG,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { slug: { equals: tenantSlug } },
    });

    const tenant = tenantRes.docs[0];
    if (!tenant) {
      console.error(`[auth:revoke-invite] no tenant with slug "${tenantSlug}"`);
      process.exit(1);
    }

    tenantId = String((tenant as { id: string | number }).id);
  }

  const count = await revokeInvitesByEmail(email, tenantId);

  if (count === 0) {
    console.log(`[auth:revoke-invite] no pending invites found for ${email}`);
  } else {
    console.log(`[auth:revoke-invite] revoked ${count} invite(s) for ${email}`);
  }

  process.exit(0);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[auth:revoke-invite] failed: ${message}`);
  process.exit(1);
});
