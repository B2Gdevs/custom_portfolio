import type { DiscoveryItem } from '@/lib/content-discovery';
import { getListenCatalog, type ListenCatalogEntry } from '@/lib/listen-catalog';
import { toListenDiscoveryItem } from '@/lib/listen-items';
import { runListenCatalogWorker } from '@/lib/listen/catalog-worker-runner';
import type { MusicTrack } from '@/lib/music';

export type ListenRuntimeBootstrap = {
  access: {
    canViewPrivate: boolean;
  };
  entries: ListenCatalogEntry[];
};

function fallbackBootstrap(): ListenRuntimeBootstrap {
  return {
    access: {
      canViewPrivate: false,
    },
    entries: getListenCatalog(),
  };
}

export async function getListenRuntimeBootstrap(
  cookieHeader = '',
): Promise<ListenRuntimeBootstrap> {
  try {
    const result = await runListenCatalogWorker({ cookieHeader });
    const body = result.body as
      | {
          ok?: boolean;
          bootstrap?: {
            access?: { canViewPrivate?: boolean };
            entries?: ListenCatalogEntry[];
          };
        }
      | undefined;

    if (body?.ok && body.bootstrap?.entries) {
      return {
        access: {
          canViewPrivate: Boolean(body.bootstrap.access?.canViewPrivate),
        },
        entries: body.bootstrap.entries,
      };
    }
  } catch {
    // fall through to the file-authored catalog
  }

  return fallbackBootstrap();
}

export async function getListenRuntimeCatalog(cookieHeader = '') {
  const { entries } = await getListenRuntimeBootstrap(cookieHeader);
  return entries;
}

export async function getMusicTracks(cookieHeader = ''): Promise<MusicTrack[]> {
  const entries = await getListenRuntimeCatalog(cookieHeader);

  return entries
    .map((entry) => {
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
    })
    .filter(Boolean) as MusicTrack[];
}

export async function getListenSearchDiscoveryItems(cookieHeader = ''): Promise<DiscoveryItem[]> {
  const entries = await getListenRuntimeCatalog(cookieHeader);
  return entries.map((entry) =>
    toListenDiscoveryItem(entry, {
      mediaPublic: entry.visibility === 'public' && !entry.lockGroup,
    }),
  );
}
