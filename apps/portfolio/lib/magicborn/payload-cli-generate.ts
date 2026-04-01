import { SITE_APP_RECORD_COLLECTION_SLUG } from '@/lib/payload/collections/siteAppRecords';
import { FALLBACK_SITE_APPS, type SiteAppRecord } from '@/lib/site-app-registry';

/** CLI alias → Payload collection (global-tooling-03-05). */
export const PAYLOAD_CLI_GENERATE_ALIASES = {
  app: {
    collection: SITE_APP_RECORD_COLLECTION_SLUG,
    label: 'Site app catalog rows',
  },
} as const;

export type PayloadCliGenerateAlias = keyof typeof PAYLOAD_CLI_GENERATE_ALIASES;

export function resolvePayloadCliOrigin(): string {
  const raw =
    process.env.MAGICBORN_PAYLOAD_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    'http://127.0.0.1:3000';
  return raw.replace(/\/$/, '');
}

/** `users` collection API key (`Authorization: users API-Key …`). */
export function resolvePayloadUsersApiKey(): string | null {
  const k =
    process.env.MAGICBORN_PAYLOAD_USERS_API_KEY?.trim() ||
    process.env.PAYLOAD_USERS_API_KEY?.trim();
  return k || null;
}

export function siteAppRecordFromFallback(slug: string): Record<string, unknown> | null {
  const app = FALLBACK_SITE_APPS.find((a) => a.id === slug);
  if (!app) {
    return null;
  }
  return siteAppRecordBodyFromRegistryRow(app);
}

export function siteAppRecordBodyFromRegistryRow(app: SiteAppRecord): Record<string, unknown> {
  return {
    title: app.title,
    slug: app.id,
    routeHref: app.href,
    description: app.description,
    iconName: app.iconName,
    ctaLabel: app.cta,
    supportHref: app.supportHref ?? null,
    supportLabel: app.supportLabel ?? null,
    supportText: app.supportText ?? null,
    exampleCode: app.exampleCode ?? null,
    featuredOrder: app.featuredOrder,
    published: true,
  };
}

type SiteAppListResponse = {
  docs?: Array<{ id?: string | number; slug?: string | null }>;
};

export async function upsertSiteAppRecordViaRest(params: {
  origin: string;
  apiKey: string;
  body: Record<string, unknown>;
  slug: string;
  fetchImpl?: typeof fetch;
}): Promise<{ ok: true; id: string | number; mode: 'created' | 'updated' } | { ok: false; message: string }> {
  const fetchFn = params.fetchImpl ?? globalThis.fetch.bind(globalThis);
  const base = params.origin.replace(/\/$/, '');
  const col = SITE_APP_RECORD_COLLECTION_SLUG;
  const listUrl = `${base}/api/${col}?limit=1&depth=0&where[slug][equals]=${encodeURIComponent(params.slug)}`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `users API-Key ${params.apiKey}`,
  };

  const findRes = await fetchFn(listUrl, { headers });
  const findJson = (await findRes.json().catch(() => null)) as SiteAppListResponse | null;
  if (!findRes.ok) {
    return {
      ok: false,
      message: `List ${col} failed (${findRes.status}): ${JSON.stringify(findJson).slice(0, 400)}`,
    };
  }
  const existing = findJson?.docs?.[0];
  const id = existing?.id;

  if (id != null && id !== '') {
    const patchUrl = `${base}/api/${col}/${id}`;
    const patchRes = await fetchFn(patchUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(params.body),
    });
    const patchJson = await patchRes.json().catch(() => null);
    if (!patchRes.ok) {
      return {
        ok: false,
        message: `PATCH ${col}/${id} failed (${patchRes.status}): ${JSON.stringify(patchJson).slice(0, 400)}`,
      };
    }
    return { ok: true, id, mode: 'updated' };
  }

  const postUrl = `${base}/api/${col}`;
  const postRes = await fetchFn(postUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(params.body),
  });
  const postJson = await postRes.json().catch(() => null);
  if (!postRes.ok) {
    return {
      ok: false,
      message: `POST ${col} failed (${postRes.status}): ${JSON.stringify(postJson).slice(0, 400)}`,
    };
  }
  const newId = (postJson as { doc?: { id?: string | number }; id?: string | number })?.doc?.id ??
    (postJson as { id?: string | number })?.id;
  if (newId == null || newId === '') {
    return { ok: false, message: 'Create succeeded but response had no id.' };
  }
  return { ok: true, id: newId, mode: 'created' };
}
