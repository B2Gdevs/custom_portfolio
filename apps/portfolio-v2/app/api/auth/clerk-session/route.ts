import { NextResponse } from 'next/server';
import { getViewerFeatureAccess } from '@/lib/auth/permissions';
import { viewerFromUser } from '@/lib/auth/viewer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/clerk-session?clerkId=user_xxx
 *
 * Looks up a Payload user by their Clerk ID and returns their session/entitlements.
 * Used by the client-side Clerk session bridge to get authorization data.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const clerkId = url.searchParams.get('clerkId');

  if (!clerkId) {
    return NextResponse.json({
      ok: false,
      error: 'Missing clerkId parameter',
      session: getViewerFeatureAccess(null),
    });
  }

  try {
    const { getPayload } = await import('payload');
    const config = await import('@/payload.config').then((m) => m.default);
    const payload = await getPayload({ config });

    // Find user by clerkId
    const result = await payload.find({
      collection: 'users',
      where: {
        'externalIds.clerkId': { equals: clerkId },
      },
      depth: 1, // Include tenant relationship
      limit: 1,
    });

    if (result.docs.length === 0) {
      // User not found - they may have authenticated via Clerk but not been synced yet
      return NextResponse.json({
        ok: false,
        error: 'User not found',
        session: getViewerFeatureAccess(null),
      });
    }

    const user = result.docs[0];
    const viewer = viewerFromUser(user, false);

    return NextResponse.json({
      ok: true,
      session: getViewerFeatureAccess(viewer),
    });
  } catch (error) {
    console.error('[api/auth/clerk-session] Error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Failed to lookup user',
      session: getViewerFeatureAccess(null),
    });
  }
}
