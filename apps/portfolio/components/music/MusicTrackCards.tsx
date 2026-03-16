import Link from 'next/link';
import { Headphones, MoveRight } from 'lucide-react';
import type { MusicTrack } from '@/lib/music';

export default function MusicTrackCards({ tracks }: { tracks: MusicTrack[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {tracks.map((track) => (
        <article
          key={track.slug}
          className="story-card overflow-hidden"
        >
          <div className="border-b border-border/70 p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[0.72rem] uppercase tracking-[0.3em] text-text-muted">
              <span>{track.era}</span>
              <span className="text-accent">•</span>
              <span>{track.genre}</span>
              <span className="text-accent">•</span>
              <span>{track.duration}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-3xl text-primary">{track.title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-text-muted">{track.description}</p>
              </div>
              <div className="hidden rounded-full border border-border bg-dark px-3 py-2 text-xs text-text-muted md:flex md:items-center md:gap-2">
                <Headphones size={14} />
                {track.mood}
              </div>
            </div>
          </div>

          <div className="bg-black/20 p-4">
            <iframe
              src={track.embedUrl}
              title={`${track.title} BandLab embed`}
              className="h-44 w-full rounded-2xl border border-border bg-dark"
              loading="lazy"
              allow="autoplay; encrypted-media; clipboard-write"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
            <p className="text-sm text-text-muted">{track.mood}</p>
            <Link
              href={track.bandlabUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-accent"
            >
              Open on BandLab
              <MoveRight size={16} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
