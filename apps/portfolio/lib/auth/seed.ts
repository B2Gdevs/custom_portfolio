import { getPayloadClient } from '@/lib/payload';
import {
  AUTH_COLLECTION_SLUG,
  OWNER_DEFAULT_ENTITLEMENTS,
  TENANT_COLLECTION_SLUG,
  getOwnerSeedConfig,
} from './config';

type SeedResult = {
  createdTenant: boolean;
  createdUser: boolean;
  tenantId: string;
  userId: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

export async function ensureOwnerSeed(): Promise<SeedResult> {
  const payload = await getPayloadClient();
  const seed = getOwnerSeedConfig();

  const existingTenant = await payload.find({
    collection: TENANT_COLLECTION_SLUG,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        equals: seed.tenantSlug,
      },
    },
  });

  let tenant = existingTenant.docs[0];
  let createdTenant = false;

  if (!tenant) {
    tenant = await payload.create({
      collection: TENANT_COLLECTION_SLUG,
      overrideAccess: true,
      data: {
        name: seed.tenantName,
        slug: seed.tenantSlug,
        description: 'Local owner tenant for the portfolio workspace.',
        isOwnerTenant: true,
        active: true,
      },
    });
    createdTenant = true;
  }

  const tenantId = asString((tenant as Record<string, unknown>).id);
  if (!tenantId) {
    throw new Error('owner seed could not resolve tenant id');
  }

  const existingUser = await payload.find({
    collection: AUTH_COLLECTION_SLUG,
    depth: 1,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      email: {
        equals: seed.email,
      },
    },
  });

  let user = existingUser.docs[0];
  let createdUser = false;

  if (!user) {
    user = await payload.create({
      collection: AUTH_COLLECTION_SLUG,
      overrideAccess: true,
      data: {
        email: seed.email,
        password: seed.password,
        displayName: seed.displayName,
        role: 'owner',
        tenant: tenantId,
        entitlements: OWNER_DEFAULT_ENTITLEMENTS,
      },
    });
    createdUser = true;
  } else {
    const userRecord = user as Record<string, unknown>;
    const tenantValue = userRecord.tenant;
    const tenantNeedsUpdate =
      typeof tenantValue === 'string'
        ? tenantValue !== tenantId
        : isObject(tenantValue)
          ? asString(tenantValue.id) !== tenantId
          : true;

    const entitlements = Array.isArray(userRecord.entitlements)
      ? userRecord.entitlements.filter(
          (entry): entry is string => typeof entry === 'string',
        )
      : [];
    const missingEntitlements = OWNER_DEFAULT_ENTITLEMENTS.filter(
      (entry) => !entitlements.includes(entry),
    );

    if (
      tenantNeedsUpdate ||
      missingEntitlements.length > 0 ||
      userRecord.role !== 'owner' ||
      userRecord.displayName !== seed.displayName
    ) {
      user = await payload.update({
        collection: AUTH_COLLECTION_SLUG,
        id: String(userRecord.id),
        overrideAccess: true,
        data: {
          displayName: seed.displayName,
          role: 'owner',
          tenant: tenantId,
          entitlements: Array.from(
            new Set([...entitlements, ...OWNER_DEFAULT_ENTITLEMENTS]),
          ),
        },
      });
    }
  }

  const userId = asString((user as Record<string, unknown>).id);
  if (!userId) {
    throw new Error('owner seed could not resolve user id');
  }

  return {
    createdTenant,
    createdUser,
    tenantId,
    userId,
  };
}
