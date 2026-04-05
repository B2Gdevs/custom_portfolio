import {
  formatReaderProgressLabel,
  readStoredReaderProgress,
  resolveReaderShelfStatus,
  useReaderReadingStore,
} from '@/lib/reader-progress';
import { afterEach, beforeEach, vi } from 'vitest';

describe('reader progress helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        get length() {
          return 0;
        },
      },
    });
    void useReaderReadingStore.persist.clearStorage();
    useReaderReadingStore.setState({
      progressByKey: {},
      locationByKey: {},
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

  it('reads and clamps progress via the reading store', () => {
    useReaderReadingStore.getState().setProgress('mordreds_tale', 1.4);
    expect(readStoredReaderProgress('mordreds_tale')).toBe(1);
  });
});
