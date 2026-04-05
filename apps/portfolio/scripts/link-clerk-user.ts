/**
 * Link existing Payload owner user to Clerk identity.
 *
 * Usage:
 *   pnpm --filter @portfolio/app exec tsx scripts/link-clerk-user.ts <clerkUserId> [clerkOrgId]
 *
 * Example:
 *   pnpm --filter @portfolio/app exec tsx scripts/link-clerk-user.ts user_xxx org_3Bn9AgebPYXukl8FbjnhN0Tff9V
 */

import { getPayload } from 'payload';
import config from '../payload.config';

type UserExternalIds = {
  clerkId?: string | null;
  stripeCustomerId?: string | null;
};

async function main() {
  const [clerkUserId, clerkOrgId] = process.argv.slice(2);

  if (!clerkUserId) {
    console.error('Usage: tsx scripts/link-clerk-user.ts <clerkUserId> [clerkOrgId]');
    console.error('');
    console.error('Get your Clerk user ID from Clerk Dashboard -> Users -> your user');
    process.exit(1);
  }

  console.log('Linking Clerk identity to Payload owner...');
  console.log(`  Clerk User ID: ${clerkUserId}`);
  if (clerkOrgId) {
    console.log(`  Clerk Org ID: ${clerkOrgId}`);
  }

  const payload = await getPayload({ config });

  // Find owner user
  const ownerResult = await payload.find({
    collection: 'users',
    where: { role: { equals: 'owner' } },
    limit: 1,
  });

  if (ownerResult.docs.length === 0) {
    console.error('No owner user found. Run pnpm auth:seed first.');
    process.exit(1);
  }

  const owner = ownerResult.docs[0] as {
    id: string | number;
    email: string;
    tenant: unknown;
    externalIds?: UserExternalIds | null;
  };
  console.log(`  Found owner: ${owner.email}`);

  await payload.update({
    collection: 'users',
    id: owner.id,
    data: {
      externalIds: {
        ...(owner.externalIds ?? {}),
        clerkId: clerkUserId,
      },
    },
  });
  console.log('  ✓ Linked Clerk user ID to owner');

  // If org ID provided, update tenant
  if (clerkOrgId) {
    const raw = owner.tenant;
    const tenantId =
      raw == null
        ? undefined
        : typeof raw === 'string' || typeof raw === 'number'
          ? raw
          : typeof raw === 'object' && raw !== null && 'id' in raw
            ? (raw as { id: string | number }).id
            : undefined;

    if (tenantId) {
      await payload.update({
        collection: 'tenants',
        id: tenantId,
        data: {
          externalIds: {
            clerkOrgId: clerkOrgId,
          },
        },
      });
      console.log('  ✓ Linked Clerk org ID to tenant');
    }
  }

  console.log('');
  console.log('Done! You can now sign in with Clerk and access your owner account.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
