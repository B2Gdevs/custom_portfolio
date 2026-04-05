'use client';

import dynamic from 'next/dynamic';
import { type ReactNode } from 'react';

const ClerkProviderLazy = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.ClerkProvider),
  { ssr: false },
);

/**
 * Conditionally wraps children with ClerkProvider when Clerk is configured.
 * Falls back to rendering children directly when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set.
 *
 * This allows the app to work with both Clerk-based and Payload-only authentication.
 */
export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkPubKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProviderLazy publishableKey={clerkPubKey}>{children}</ClerkProviderLazy>
  );
}
