/**
 * Maps Payload `site-app-records` docs to `SiteAppRecord`. Server/worker only — imports `site-download-assets`.
 */
import { isIconName, type SiteAppRecord, type SiteAppRecordDoc } from '@/lib/site-app-registry';
import { toSiteDownloadLinks } from '@/lib/site-download-assets';

export function toSiteAppRecord(doc: SiteAppRecordDoc): SiteAppRecord | null {
  if (
    !doc.slug ||
    !doc.title ||
    !doc.routeHref ||
    !doc.description ||
    !isIconName(doc.iconName) ||
    !doc.ctaLabel
  ) {
    return null;
  }

  return {
    id: doc.slug,
    title: doc.title,
    description: doc.description,
    href: doc.routeHref,
    iconName: doc.iconName,
    cta: doc.ctaLabel,
    supportHref: doc.supportHref ?? undefined,
    supportLabel: doc.supportLabel ?? undefined,
    supportText: doc.supportText ?? undefined,
    exampleCode: doc.exampleCode ?? undefined,
    downloads: toSiteDownloadLinks(doc.downloads),
    featuredOrder: doc.featuredOrder ?? 0,
  };
}
