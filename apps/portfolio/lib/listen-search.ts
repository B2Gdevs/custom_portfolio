import { getListenCatalog } from '@/lib/listen-catalog';
import type { DiscoveryItem } from '@/lib/content-discovery';
import { toListenDiscoveryItem } from '@/lib/listen-items';

/** Search hits omit embed URLs for gated rows. */
export function getListenSearchDiscoveryItems(): DiscoveryItem[] {
  return getListenCatalog().map((entry) =>
    toListenDiscoveryItem(entry, { mediaPublic: !entry.lockGroup })
  );
}
