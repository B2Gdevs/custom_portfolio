import { describe, expect, it } from 'vitest';
import { isImmersiveAppsRoute } from '@/lib/app-routes';

describe('isImmersiveAppsRoute', () => {
  it('returns true for reader and nested reader paths', () => {
    expect(isImmersiveAppsRoute('/apps/reader')).toBe(true);
    expect(isImmersiveAppsRoute('/apps/reader/something')).toBe(true);
  });

  it('returns true for screenshot-annotate', () => {
    expect(isImmersiveAppsRoute('/apps/screenshot-annotate')).toBe(true);
    expect(isImmersiveAppsRoute('/apps/screenshot-annotate/')).toBe(true);
  });

  it('returns false for other apps and site routes', () => {
    expect(isImmersiveAppsRoute('/apps')).toBe(false);
    expect(isImmersiveAppsRoute('/apps/dialogue-forge')).toBe(false);
    expect(isImmersiveAppsRoute('/')).toBe(false);
    expect(isImmersiveAppsRoute(null)).toBe(false);
    expect(isImmersiveAppsRoute(undefined)).toBe(false);
  });
});
