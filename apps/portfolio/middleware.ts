import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';

/**
 * Middleware that conditionally applies Clerk authentication when configured.
 *
 * When CLERK_SECRET_KEY is set, this uses Clerk's middleware for session management.
 * Otherwise, it passes requests through unchanged (Payload-only auth path).
 */
export async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Check if Clerk is configured
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (clerkSecretKey) {
    // Dynamically import and apply Clerk middleware
    try {
      const { clerkMiddleware, createRouteMatcher } = await import(
        '@clerk/nextjs/server'
      );

      // Define public routes that don't require auth
      const isPublicRoute = createRouteMatcher([
        '/',
        '/docs(.*)',
        '/projects(.*)',
        '/blog(.*)',
        '/apps(.*)',
        '/resumes(.*)',
        '/listen(.*)',
        '/api/webhooks/clerk',
        '/sign-in(.*)',
        '/sign-up(.*)',
      ]);

      // Create the middleware handler
      const handler = clerkMiddleware(async (auth, req) => {
        // Protect non-public routes
        if (!isPublicRoute(req)) {
          await auth.protect();
        }
      });

      return handler(request, event);
    } catch (error) {
      // If Clerk import fails, pass through (package may not be installed)
      console.warn('Clerk middleware not available:', error);
      return NextResponse.next();
    }
  }

  // No Clerk configured, pass through
  return NextResponse.next();
}

export const config = {
  // Match all paths except static files and api routes that shouldn't be processed
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
