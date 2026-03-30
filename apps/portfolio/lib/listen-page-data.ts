import type { ListenCatalogEntry } from '@/lib/listen-catalog';
import { getListenCatalog } from '@/lib/listen-catalog';
import { resolveListenEmbedSrc } from '@/lib/bandlab-embed';
import { runListenCatalogWorker } from '@/lib/listen/catalog-worker-runner';
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

async function getListenBootstrap(cookieHeader: string) {
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
    // fall back to file-backed catalog only
  }

  return {
    access: {
      canViewPrivate: false,
    },
    entries: getListenCatalog(),
  };
}

export async function buildListenPageRows({
  cookieStore,
  cookieHeader,
}: {
  cookieStore: CookieReader;
  cookieHeader: string;
}): Promise<ListenPageRow[]> {
  const { access, entries } = await getListenBootstrap(cookieHeader);
  const unlockedGroups = getUnlockedListenGroups(cookieStore, entries);
  return entries.map((entry) => {
    const hasLegacyLock = Boolean(entry.lockGroup);
    const unlocked = !entry.lockGroup || unlockedGroups.has(entry.lockGroup);
    const mediaPublic =
      entry.visibility === 'public'
        ? unlocked
        : access.canViewPrivate || (hasLegacyLock && unlocked);
    const embedSrc = resolveListenEmbedSrc({
      catalogKind: entry.catalogKind,
      embedUrl: entry.embedUrl,
      bandlabUrl: entry.bandlabUrl,
    });

    return {
      item: toListenDiscoveryItem(entry, { mediaPublic }),
      locked:
        entry.visibility === 'private'
          ? !(access.canViewPrivate || (hasLegacyLock && unlocked))
          : Boolean(entry.lockGroup && !unlocked),
      lockGroup:
        entry.visibility === 'private' && !access.canViewPrivate && !hasLegacyLock
          ? null
          : (entry.lockGroup ?? null),
      embedUrl: mediaPublic ? embedSrc : '',
      bandlabUrl: mediaPublic ? entry.bandlabUrl : '',
    };
  });
}
