import { describe, expect, it } from 'vitest';
import { isImmersiveAppsRoute, isReaderAppsRoute } from '@/lib/app-routes';

describe('isImmersiveAppsRoute', () => {
  it('returns false for reader (reader is not immersive; site sidebar is hidden separately)', () => {
    expect(isImmersiveAppsRoute('/apps/reader')).toBe(false);
    expect(isImmersiveAppsRoute('/apps/reader/something')).toBe(false);
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

describe('isReaderAppsRoute', () => {
  it('returns true for reader paths', () => {
    expect(isReaderAppsRoute('/apps/reader')).toBe(true);
    expect(isReaderAppsRoute('/apps/reader/something')).toBe(true);
  });

  it('returns false for other routes', () => {
    expect(isReaderAppsRoute('/apps/screenshot-annotate')).toBe(false);
    expect(isReaderAppsRoute('/apps')).toBe(false);
    expect(isReaderAppsRoute(null)).toBe(false);
  });
});
