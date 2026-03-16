import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import MusicTrackCards from '@/components/music/MusicTrackCards';
import type { MusicTrack } from '@/lib/music';

export default function SoundtrackSection({ tracks }: { tracks: MusicTrack[] }) {
  return (
    <section
      id="listen"
      className="section-shell"
    >
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="section-kicker">Listen</p>
          <h2 className="font-display text-4xl text-primary md:text-6xl">Songs that live beside the pages</h2>
          <p className="mt-5 text-lg leading-8 text-text-muted">
            Music belongs here as part of the same world-building practice. For now, these tracks act as working signals for tone, pressure, and atmosphere while the catalog grows.
          </p>
        </div>

        <Link
          href="/listen"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-accent"
        >
          Visit the listening room
          <ArrowRight size={16} />
        </Link>
      </div>

      <MusicTrackCards tracks={tracks} />
    </section>
  );
}
