import { createFlagsDiscoveryEndpoint, getProviderData } from 'flags/next';
import * as flags from '@/flags';

/** Surfaces flag definitions to Vercel Flags / Explorer (requires `FLAGS` / `FLAGS_SECRET` on Vercel). */
export const GET = createFlagsDiscoveryEndpoint(async () => getProviderData(flags));
