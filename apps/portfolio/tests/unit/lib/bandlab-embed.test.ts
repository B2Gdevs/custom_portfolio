import { bandlabEffectPresetEmbedSrc, resolveListenEmbedSrc } from '@/lib/bandlab-embed';

describe('bandlab embed URLs', () => {
  it('maps effect-preset page URLs to embed/effect-preset iframe src', () => {
    const page =
      'https://www.bandlab.com/effect-presets/8f8d1ca2196640c1aeaac13e51383e11-b62e01a253b848829eebaffa3aa676fc-6f5153d425ed421588dc168449324f74-user';
    expect(bandlabEffectPresetEmbedSrc(page)).toBe(
      'https://www.bandlab.com/embed/effect-preset/8f8d1ca2196640c1aeaac13e51383e11-b62e01a253b848829eebaffa3aa676fc-6f5153d425ed421588dc168449324f74-user'
    );
  });

  it('is case-insensitive on the host and path', () => {
    expect(
      bandlabEffectPresetEmbedSrc('HTTPS://WWW.BANDLAB.COM/effect-presets/Foo-Bar-USER')
    ).toBe('https://www.bandlab.com/embed/effect-preset/Foo-Bar-USER');
  });

  it('returns null when not a preset page', () => {
    expect(bandlabEffectPresetEmbedSrc('https://www.bandlab.com/track/x')).toBeNull();
  });

  it('resolveListenEmbedSrc prefers explicit embedUrl for tracks', () => {
    expect(
      resolveListenEmbedSrc({
        catalogKind: 'track',
        embedUrl: 'https://www.bandlab.com/embed/?id=abc',
        bandlabUrl: 'https://www.bandlab.com/track/x',
      })
    ).toBe('https://www.bandlab.com/embed/?id=abc');
  });

  it('resolveListenEmbedSrc derives preset iframe when embedUrl empty', () => {
    expect(
      resolveListenEmbedSrc({
        catalogKind: 'preset',
        embedUrl: '',
        bandlabUrl: 'https://www.bandlab.com/effect-presets/my-preset-id-user',
      })
    ).toBe('https://www.bandlab.com/embed/effect-preset/my-preset-id-user');
  });
});
