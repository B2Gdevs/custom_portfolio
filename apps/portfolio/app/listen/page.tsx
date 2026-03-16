import MusicTrackCards from '@/components/music/MusicTrackCards';
import { getMusicTracks } from '@/lib/music';

export default function ListenPage() {
  const tracks = getMusicTracks();

  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="section-kicker">Listen</p>
        <h1 className="font-display text-5xl text-primary md:text-7xl">Songs in the same weather system</h1>
        <p className="mt-6 text-lg leading-8 text-text-muted">
          These tracks are placeholders and companions for now, but they already belong to the same public surface as the book. This page can grow into a proper listening room without changing the site structure again.
        </p>
      </div>

      <div className="mt-14">
        <MusicTrackCards tracks={tracks} />
      </div>
    </div>
  );
}
