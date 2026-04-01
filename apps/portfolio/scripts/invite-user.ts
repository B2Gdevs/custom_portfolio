/**
 * Create a tenant user without the Payload admin UI (operator / invite flow).
 *
 *   pnpm auth:invite -- --email=a@b.com --password=secret --role=admin --tenant-slug=magicborn-studios
 *
 * Roles:
 * - admin — same entitlements as the seeded owner (admin surface, media gen, reader writes)
 * - member — no entitlements (read-only / public-level gates; use export paths in reader)
 */
import {
  AUTH_COLLECTION_SLUG,
  OWNER_DEFAULT_ENTITLEMENTS,
  TENANT_COLLECTION_SLUG,
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
  const password = arg('password');
  const role = (arg('role')?.trim() || 'member') as 'admin' | 'member';
  const tenantSlug = arg('tenant-slug')?.trim();
  const displayName = arg('name')?.trim() || email;

  if (!email || !password) {
    console.error(
      'Usage: pnpm auth:invite -- --email=user@host --password=... --role=admin|member --tenant-slug=your-tenant [--name="Display"]',
    );
    process.exit(1);
  }

  if (role !== 'admin' && role !== 'member') {
    console.error('[auth:invite] role must be admin or member');
    process.exit(1);
  }

  if (!tenantSlug) {
    console.error('[auth:invite] --tenant-slug is required (use the owner tenant slug from seed)');
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

  const tenantId = (tenant as { id: string | number }).id;

  const existing = await payload.find({
    collection: AUTH_COLLECTION_SLUG,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { email: { equals: email } },
  });

  const entitlements: AuthEntitlement[] =
    role === 'admin' ? [...OWNER_DEFAULT_ENTITLEMENTS] : [];

  if (existing.docs[0]) {
    const id = String((existing.docs[0] as { id: string | number }).id);
    await payload.update({
      collection: AUTH_COLLECTION_SLUG,
      id,
      overrideAccess: true,
      data: {
        password,
        displayName,
        role,
        tenant: tenantId,
        entitlements,
      },
    });
    console.log(`[auth:invite] updated user ${email} (${role})`);
  } else {
    await payload.create({
      collection: AUTH_COLLECTION_SLUG,
      overrideAccess: true,
      data: {
        email,
        password,
        displayName,
        role,
        tenant: tenantId,
        entitlements,
      },
    });
    console.log(`[auth:invite] created user ${email} (${role})`);
  }

  process.exit(0);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[auth:invite] failed: ${message}`);
  process.exit(1);
});
