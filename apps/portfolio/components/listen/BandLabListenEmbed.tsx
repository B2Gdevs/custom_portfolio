'use client';

import { cn } from '@/lib/utils';

type BandLabListenEmbedProps = {
  src: string;
  title: string;
  variant: 'track' | 'preset';
};

/**
 * BandLab iframes: revision players vs effect-preset embeds need different chrome and height.
 */
export function BandLabListenEmbed({ src, title, variant }: BandLabListenEmbedProps) {
  const isPreset = variant === 'preset';

  return (
    <div
      className={cn(
        'p-4',
        isPreset ? 'bg-gradient-to-b from-amber-950/25 to-black/25' : 'bg-black/20'
      )}
    >
      <iframe
        src={src}
        title={title}
        className={cn(
          'w-full rounded-2xl border bg-dark shadow-inner',
          isPreset
            ? 'min-h-[min(26rem,70vh)] h-[26rem] sm:h-[28rem] border-amber-400/30'
            : 'h-44 border-border'
        )}
        loading="lazy"
        allow="autoplay; encrypted-media; clipboard-write; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
