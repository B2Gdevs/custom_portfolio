import { getListenCatalog } from '@/lib/listen-catalog';
import { listenGroupCookieName } from '@/lib/listen-unlock';
import { toListenDiscoveryItem, type ListenPageRow } from '@/lib/listen-items';

type CookieReader = { get: (name: string) => { value: string } | undefined };

export function getUnlockedListenGroups(cookieStore: CookieReader): Set<string> {
  const groups = new Set<string>();
  for (const entry of getListenCatalog()) {
    if (entry.lockGroup) groups.add(entry.lockGroup);
  }
  const unlocked = new Set<string>();
  for (const g of groups) {
    const c = cookieStore.get(listenGroupCookieName(g));
    if (c?.value === '1') unlocked.add(g);
  }
  return unlocked;
}

export function buildListenPageRows(cookieStore: CookieReader): ListenPageRow[] {
  const unlockedGroups = getUnlockedListenGroups(cookieStore);
  return getListenCatalog().map((entry) => {
    const unlocked = !entry.lockGroup || unlockedGroups.has(entry.lockGroup);
    const item = toListenDiscoveryItem(entry, { mediaPublic: unlocked });
    return {
      item,
      locked: Boolean(entry.lockGroup && !unlocked),
      lockGroup: entry.lockGroup ?? null,
      embedUrl: unlocked ? entry.embedUrl : '',
      bandlabUrl: unlocked ? entry.bandlabUrl : '',
    };
  });
}
