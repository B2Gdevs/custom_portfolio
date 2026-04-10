import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Clerk webhook endpoint for user and organization sync.
 *
 * Handles:
 * - user.created: Create corresponding Payload user
 * - user.updated: Update Payload user profile fields
 * - user.deleted: Mark Payload user as inactive (soft delete)
 * - organization.created: Create corresponding Payload tenant
 * - organization.updated: Update Payload tenant
 * - organizationMembership.created: Update user's tenant relationship
 *
 * Webhook secret validation uses svix library provided by Clerk.
 * Configure webhook in Clerk dashboard: https://dashboard.clerk.com -> Webhooks
 */
export async function POST(request: Request) {
  // Check if Clerk is configured
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Clerk webhook not configured' },
      { status: 500 }
    );
  }

  try {
    // Get the headers for signature verification
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    // Get the body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Verify the webhook signature using Svix
    let evt: WebhookEvent;
    try {
      const { Webhook } = await import('svix');
      const wh = new Webhook(webhookSecret);
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    const eventType = evt.type;
    console.log(`[clerk-webhook] Received event: ${eventType}`);

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      case 'organization.created':
        await handleOrganizationCreated(evt.data);
        break;
      case 'organization.updated':
        await handleOrganizationUpdated(evt.data);
        break;
      case 'organizationMembership.created':
        await handleMembershipCreated(evt.data);
        break;
      default:
        console.log(`[clerk-webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[clerk-webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Types for Clerk webhook events
interface WebhookEvent {
  type: string;
  data: Record<string, unknown>;
}

interface ClerkUser {
  id: string;
  email_addresses: Array<{ email_address: string; id: string }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  primary_email_address_id: string | null;
}

interface ClerkOrganization {
  id: string;
  name: string;
  slug: string;
}

interface ClerkMembership {
  id: string;
  organization: { id: string };
  public_user_data: { user_id: string };
  role: string;
}

/** Matches `users` collection `externalIds` group */
type UserExternalIds = {
  clerkId?: string | null;
  stripeCustomerId?: string | null;
};

/** Matches `tenants` collection `externalIds` group */
type TenantExternalIds = {
  clerkOrgId?: string | null;
  stripeAccountId?: string | null;
};

type UserDocWithExternal = {
  externalIds?: UserExternalIds | null;
  displayName?: string | null;
  avatarUrl?: string | null;
};

type TenantDocWithExternal = {
  externalIds?: TenantExternalIds | null;
};

/**
 * Handle user.created event - create Payload user
 */
async function handleUserCreated(data: Record<string, unknown>) {
  const user = data as unknown as ClerkUser;
  const primaryEmail = user.email_addresses.find(
    (e) => e.id === user.primary_email_address_id
  )?.email_address;

  if (!primaryEmail) {
    console.error('[clerk-webhook] User has no primary email');
    return;
  }

  const displayName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(' ');

  try {
    const { getPayload } = await import('payload');
    const config = await import('@/payload.config').then((m) => m.default);
    const payload = await getPayload({ config });

    // Check if user already exists by email or clerkId
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        or: [
          { email: { equals: primaryEmail } },
          { 'externalIds.clerkId': { equals: user.id } },
        ],
      },
      limit: 1,
    });

    if (existingUser.docs.length > 0) {
      const existingDoc = existingUser.docs[0] as UserDocWithExternal & { id: string | number };
      const prev = existingDoc.externalIds ?? {};
      await payload.update({
        collection: 'users',
        id: existingDoc.id,
        data: {
          externalIds: {
            ...prev,
            clerkId: user.id,
          },
          displayName: displayName || existingDoc.displayName,
          avatarUrl: user.image_url ?? existingDoc.avatarUrl,
        },
      });
      console.log(`[clerk-webhook] Updated existing user: ${primaryEmail}`);
      return;
    }

    // Get default tenant (owner tenant)
    const defaultTenant = await payload.find({
      collection: 'tenants',
      where: { isOwnerTenant: { equals: true } },
      limit: 1,
    });

    if (defaultTenant.docs.length === 0) {
      console.error('[clerk-webhook] No default tenant found');
      return;
    }

    // Create new user with minimal permissions (default-deny)
    await payload.create({
      collection: 'users',
      data: {
        email: primaryEmail,
        password: crypto.randomUUID(), // Random password, user will use Clerk
        displayName: displayName || primaryEmail.split('@')[0],
        avatarUrl: user.image_url,
        role: 'member', // Default role
        tenant: defaultTenant.docs[0].id,
        entitlements: [], // Empty - default deny
        externalIds: {
          clerkId: user.id,
        },
      },
    });

    console.log(`[clerk-webhook] Created new user: ${primaryEmail}`);
  } catch (error) {
    console.error('[clerk-webhook] Error creating user:', error);
    throw error;
  }
}

/**
 * Handle user.updated event - update Payload user profile
 */
async function handleUserUpdated(data: Record<string, unknown>) {
  const user = data as unknown as ClerkUser;

  try {
    const { getPayload } = await import('payload');
    const config = await import('@/payload.config').then((m) => m.default);
    const payload = await getPayload({ config });

    // Find user by clerkId
    const existingUser = await payload.find({
      collection: 'users',
      where: { 'externalIds.clerkId': { equals: user.id } },
      limit: 1,
    });

    if (existingUser.docs.length === 0) {
      console.log(`[clerk-webhook] User not found for update: ${user.id}`);
      return;
    }

    const displayName = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(' ');

    // Update profile fields only (preserve role, tenant, entitlements)
    await payload.update({
      collection: 'users',
      id: existingUser.docs[0].id,
      data: {
        displayName: displayName || undefined,
        avatarUrl: user.image_url || undefined,
      },
    });

    console.log(`[clerk-webhook] Updated user profile: ${user.id}`);
  } catch (error) {
    console.error('[clerk-webhook] Error updating user:', error);
    throw error;
  }
}

/**
 * Handle user.deleted event - soft delete Payload user
 */
async function handleUserDeleted(data: Record<string, unknown>) {
  const { id } = data as { id: string };

  try {
    const { getPayload } = await import('payload');
    const config = await import('@/payload.config').then((m) => m.default);
    const payload = await getPayload({ config });

    // Find user by clerkId
    const existingUser = await payload.find({
      collection: 'users',
      where: { 'externalIds.clerkId': { equals: id } },
      limit: 1,
    });

    if (existingUser.docs.length === 0) {
      console.log(`[clerk-webhook] User not found for deletion: ${id}`);
      return;
    }

    const doc = existingUser.docs[0] as UserDocWithExternal & { id: string | number };
    const prev = doc.externalIds ?? {};

    await payload.update({
      collection: 'users',
      id: doc.id,
      data: {
        externalIds: {
          ...prev,
          clerkId: null,
        },
        entitlements: [],
      },
    });

    console.log(`[clerk-webhook] Disabled user: ${id}`);
  } catch (error) {
    console.error('[clerk-webhook] Error deleting user:', error);
    throw error;
  }
}

/**
 * Handle organization.created event - create Payload tenant
 */
async function handleOrganizationCreated(data: Record<string, unknown>) {
  const org = data as unknown as ClerkOrganization;

  try {
    const { getPayload } = await import('payload');
    const config = await import('@/payload.config').then((m) => m.default);
    const payload = await getPayload({ config });

    // Check if tenant already exists
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: {
        or: [
          { slug: { equals: org.slug } },
          { 'externalIds.clerkOrgId': { equals: org.id } },
        ],
      },
      limit: 1,
    });

    if (existingTenant.docs.length > 0) {
      const doc = existingTenant.docs[0] as TenantDocWithExternal & { id: string | number };
      const prev = doc.externalIds ?? {};
      await payload.update({
        collection: 'tenants',
        id: doc.id,
        data: {
          externalIds: {
            ...prev,
            clerkOrgId: org.id,
          },
        },
      });
      console.log(`[clerk-webhook] Updated existing tenant: ${org.slug}`);
      return;
    }

    // Create new tenant
    await payload.create({
      collection: 'tenants',
      data: {
        name: org.name,
        slug: org.slug,
        isOwnerTenant: false,
        active: true,
        externalIds: {
          clerkOrgId: org.id,
        },
      },
    });

    console.log(`[clerk-webhook] Created new tenant: ${org.slug}`);
  } catch (error) {
    console.error('[clerk-webhook] Error creating tenant:', error);
    throw error;
  }
}

/**
 * Handle organization.updated event - update Payload tenant
 */
async function handleOrganizationUpdated(data: Record<string, unknown>) {
  const org = data as unknown as ClerkOrganization;

  try {
    const { getPayload } = await import('payload');
    const config = await import('@/payload.config').then((m) => m.default);
    const payload = await getPayload({ config });

    // Find tenant by clerkOrgId
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: { 'externalIds.clerkOrgId': { equals: org.id } },
      limit: 1,
    });

    if (existingTenant.docs.length === 0) {
      console.log(`[clerk-webhook] Tenant not found for update: ${org.id}`);
      return;
    }

    await payload.update({
      collection: 'tenants',
      id: existingTenant.docs[0].id,
      data: {
        name: org.name,
        slug: org.slug,
      },
    });

    console.log(`[clerk-webhook] Updated tenant: ${org.slug}`);
  } catch (error) {
    console.error('[clerk-webhook] Error updating tenant:', error);
    throw error;
  }
}

/**
 * Handle organizationMembership.created event - update user's tenant
 */
async function handleMembershipCreated(data: Record<string, unknown>) {
  const membership = data as unknown as ClerkMembership;
  const userId = membership.public_user_data.user_id;
  const orgId = membership.organization.id;

  try {
    const { getPayload } = await import('payload');
    const config = await import('@/payload.config').then((m) => m.default);
    const payload = await getPayload({ config });

    // Find user and tenant
    const [user, tenant] = await Promise.all([
      payload.find({
        collection: 'users',
        where: { 'externalIds.clerkId': { equals: userId } },
        limit: 1,
      }),
      payload.find({
        collection: 'tenants',
        where: { 'externalIds.clerkOrgId': { equals: orgId } },
        limit: 1,
      }),
    ]);

    if (user.docs.length === 0 || tenant.docs.length === 0) {
      console.log(
        `[clerk-webhook] User or tenant not found for membership: ${userId} -> ${orgId}`
      );
      return;
    }

    // Map Clerk role to Payload role
    const payloadRole =
      membership.role === 'org:admin' ? 'admin' : 'member';

    await payload.update({
      collection: 'users',
      id: user.docs[0].id,
      data: {
        tenant: tenant.docs[0].id,
        role: payloadRole,
      },
    });

    console.log(
      `[clerk-webhook] Updated membership: ${userId} -> ${orgId} (${payloadRole})`
    );
  } catch (error) {
    console.error('[clerk-webhook] Error updating membership:', error);
    throw error;
  }
}
