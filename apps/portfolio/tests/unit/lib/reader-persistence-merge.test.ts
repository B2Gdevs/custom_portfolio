import { mergePersistedAnnotations } from '@portfolio/repub-builder/reader';

describe('reader persistence merge', () => {
  it('prefers newer annotations when local and remote share ids', () => {
    const merged = mergePersistedAnnotations(
      [
        {
          id: 'a1',
          cfiRange: 'epubcfi(/6/2[a]!/4/2,/1:0,/1:4)',
          quote: 'local',
          note: 'local note',
          color: 'amber',
          createdAt: '2026-03-30T00:00:00.000Z',
          updatedAt: '2026-03-30T01:00:00.000Z',
        },
      ],
      [
        {
          id: 'a1',
          cfiRange: 'epubcfi(/6/2[a]!/4/2,/1:0,/1:4)',
          quote: 'remote',
          note: 'older remote note',
          color: 'amber',
          createdAt: '2026-03-30T00:00:00.000Z',
          updatedAt: '2026-03-30T00:30:00.000Z',
        },
      ],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0]?.note).toBe('local note');
  });
});
