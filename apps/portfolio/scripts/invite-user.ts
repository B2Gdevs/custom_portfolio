/**
 * Create a tenant-scoped, single-use invite link (operator / invite flow).
 *
 *   pnpm auth:invite -- --email=a@b.com --role=admin|member --tenant-slug=magicborn-studios
 *
 * Outputs a one-time accept URL. The invited user sets their own password in the browser.
 * Use `pnpm auth:seed` for the initial owner account.
 */
import {
  TENANT_COLLECTION_SLUG,
} from '@/lib/auth/config';
import { createInviteToken, type InviteRole } from '@/lib/auth/invite';
import { getPayloadClient } from '@/lib/payload';
import { loadScriptEnv } from './load-script-env';

loadScriptEnv();

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : undefined;
}

function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000').replace(/\/$/, '');
}

async function main() {
  const email = arg('email')?.trim();
  const role = (arg('role')?.trim() || 'member') as InviteRole;
  const tenantSlug = arg('tenant-slug')?.trim();

  if (!email) {
    console.error(
      'Usage: pnpm auth:invite -- --email=user@host --role=admin|member --tenant-slug=your-tenant',
    );
    process.exit(1);
  }

  if (role !== 'admin' && role !== 'member') {
    console.error('[auth:invite] role must be admin or member');
    process.exit(1);
  }

  if (!tenantSlug) {
    console.error('[auth:invite] --tenant-slug is required');
    process.exit(1);
  }

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
    console.error(`[auth:invite] no tenant with slug "${tenantSlug}"`);
    process.exit(1);
  }

  const tenantId = String((tenant as { id: string | number }).id);

  const { plaintext } = await createInviteToken({
    email,
    tenantId,
    role,
  });

  const acceptUrl = `${getSiteUrl()}/invite/accept?token=${plaintext}`;

  console.log(`[auth:invite] invite created for ${email} (${role})`);
  console.log(`[auth:invite] accept URL:\n\n  ${acceptUrl}\n`);
  console.log(`[auth:invite] expires in 72 hours — share this link securely`);

  process.exit(0);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[auth:invite] failed: ${message}`);
  process.exit(1);
});
