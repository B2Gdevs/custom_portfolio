'use client';

import { type ReactNode } from 'react';

/**
 * Conditionally wraps children with ClerkProvider when Clerk is configured.
 * Falls back to rendering children directly when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set.
 *
 * This allows the app to work with both Clerk-based and Payload-only authentication.
 */
export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If Clerk is not configured, render children directly
  if (!clerkPubKey) {
    return <>{children}</>;
  }

  // Dynamically import ClerkProvider only when configured
  // This prevents build errors when @clerk/nextjs is not installed
  const ClerkProviderLazy = require('@clerk/nextjs').ClerkProvider;

  return (
    <ClerkProviderLazy publishableKey={clerkPubKey}>
      {children}
    </ClerkProviderLazy>
  );
}
