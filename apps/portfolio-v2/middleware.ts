import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

/**
 * When CLERK_SECRET_KEY is set, Clerk middleware manages sessions.
 * Public routes match this reader-only surface (narrowed from the main portfolio app).
 */
export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (clerkSecretKey) {
    try {
      const { clerkMiddleware, createRouteMatcher } = await import('@clerk/nextjs/server');

      const isPublicRoute = createRouteMatcher([
        '/',
        '/api/webhooks/clerk',
        '/api/auth/session(.*)',
        '/api/auth/login(.*)',
        '/api/auth/logout(.*)',
        '/api/auth/clerk-session(.*)',
        '/api/auth/invite/accept(.*)',
        '/api/published-book-artifacts/(.*)',
        '/api/reader/(.*)',
        '/sign-in(.*)',
        '/sign-up(.*)',
      ]);

      const handler = clerkMiddleware(async (auth, req) => {
        if (!isPublicRoute(req)) {
          await auth.protect();
        }
      });

      return handler(request, event);
    } catch (error) {
      console.warn('Clerk middleware not available:', error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
