import type { ListenCatalogEntry } from '@/lib/listen-catalog';
import { getListenCatalog } from '@/lib/listen-catalog';

export interface MusicTrack {
  slug: string;
  title: string;
  genre: string;
  duration: string;
  mood: string;
  era: string;
  description: string;
  bandlabUrl: string;
  embedUrl: string;
}

function entryToPublicTrack(entry: ListenCatalogEntry): MusicTrack | null {
  if (entry.catalogKind !== 'track') return null;
  if (entry.visibility !== 'public' || entry.lockGroup) return null;
  return {
    slug: entry.slug,
    title: entry.title,
    genre: entry.genre,
    duration: entry.duration ?? '—',
    mood: entry.mood,
    era: entry.era,
    description: entry.description,
    bandlabUrl: entry.bandlabUrl,
    embedUrl: entry.embedUrl,
  };
}

/** Public, unlocked tracks only (home soundtrack section). */
export function getMusicTracks(): MusicTrack[] {
  return getListenCatalog().map(entryToPublicTrack).filter(Boolean) as MusicTrack[];
}
