import type { AuthViewer } from './viewer';
import { canAccessAdminSurface } from './permissions';

/**
 * Image generation and other privileged media mutations: tenant operators with
 * `admin:access` (owner seed + invited admins). Not public.
 */
export function canGeneratePortfolioMedia(viewer: AuthViewer): boolean {
  return canAccessAdminSurface(viewer);
}
