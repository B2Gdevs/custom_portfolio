import {
  EPUB_PROGRESS_STORAGE_PREFIX,
  formatReaderProgressLabel,
  readStoredReaderProgress,
  resolveReaderShelfStatus,
} from '@/lib/reader-progress';
import { afterEach, beforeEach, vi } from 'vitest';

describe('reader progress helpers', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        clear: () => {
          storage.clear();
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('formats new, in-progress, and done labels', () => {
    expect(formatReaderProgressLabel(0)).toEqual({ kind: 'new', label: 'New', progress: 0 });
    expect(formatReaderProgressLabel(0.42)).toEqual({ kind: 'progress', label: '42%', progress: 0.42 });
    expect(formatReaderProgressLabel(1)).toEqual({ kind: 'done', label: 'Done', progress: 1 });
  });

  it('resolves coming soon for non-emitted books', () => {
    expect(resolveReaderShelfStatus(false, null)).toEqual({
      kind: 'coming-soon',
      label: 'Coming soon',
      progress: null,
    });
  });

  it('reads and clamps stored progress from local storage', () => {
    storage.set(`${EPUB_PROGRESS_STORAGE_PREFIX}mordreds_tale`, '1.4');

    expect(readStoredReaderProgress('mordreds_tale')).toBe(1);
  });
});
