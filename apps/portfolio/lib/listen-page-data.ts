import type { ListenCatalogEntry } from '@/lib/listen-catalog';
import { resolveListenEmbedSrc } from '@/lib/bandlab-embed';
import { getListenRuntimeBootstrap } from '@/lib/listen-runtime';
import { listenGroupCookieName } from '@/lib/listen-unlock';
import { toListenDiscoveryItem, type ListenPageRow } from '@/lib/listen-items';

type CookieReader = {
  get: (name: string) => { value: string } | undefined;
};

export function getUnlockedListenGroups(
  cookieStore: CookieReader,
  entries: ListenCatalogEntry[],
): Set<string> {
  const groups = new Set<string>();
  for (const entry of entries) {
    if (entry.lockGroup) groups.add(entry.lockGroup);
  }
  const unlocked = new Set<string>();
  for (const g of groups) {
    const c = cookieStore.get(listenGroupCookieName(g));
    if (c?.value === '1') unlocked.add(g);
  }
  return unlocked;
}

export async function buildListenPageRows({
  cookieStore,
  cookieHeader,
}: {
  cookieStore: CookieReader;
  cookieHeader: string;
}): Promise<ListenPageRow[]> {
  const { access, entries } = await getListenRuntimeBootstrap(cookieHeader);
  const unlockedGroups = getUnlockedListenGroups(cookieStore, entries);
  return entries.flatMap((entry) => {
    if (entry.visibility === 'private' && !access.canViewPrivate) {
      return [];
    }

    const unlocked = !entry.lockGroup || unlockedGroups.has(entry.lockGroup);
    const mediaPublic = entry.visibility === 'private' ? access.canViewPrivate : unlocked;
    const embedSrc = resolveListenEmbedSrc({
      catalogKind: entry.catalogKind,
      embedUrl: entry.embedUrl,
      bandlabUrl: entry.bandlabUrl,
    });

    return [
      {
        item: toListenDiscoveryItem(entry, { mediaPublic }),
        locked: entry.visibility === 'public' ? Boolean(entry.lockGroup && !unlocked) : false,
        lockGroup: entry.visibility === 'public' ? (entry.lockGroup ?? null) : null,
        embedUrl: mediaPublic ? embedSrc : '',
        bandlabUrl: mediaPublic ? entry.bandlabUrl : '',
      },
    ];
  });
}
