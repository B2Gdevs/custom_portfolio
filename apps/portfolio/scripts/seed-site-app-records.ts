import { getPayloadClient } from '@/lib/payload';
import { FALLBACK_SITE_APPS } from '@/lib/site-app-registry';
import { loadScriptEnv } from './load-script-env';

loadScriptEnv();

async function main() {
  const payload = await getPayloadClient();
  let created = 0;
  let updated = 0;

  for (const app of FALLBACK_SITE_APPS) {
    const existing = await payload.find({
      collection: 'site-app-records',
      depth: 0,
      limit: 1,
      where: {
        slug: {
          equals: app.id,
        },
      },
    });

    const fields = {
      title: app.title,
      slug: app.id,
      routeHref: app.href,
      description: app.description,
      iconName: app.iconName,
      ctaLabel: app.cta,
      supportHref: app.supportHref,
      supportLabel: app.supportLabel,
      supportText: app.supportText,
      exampleCode: app.exampleCode,
      featuredOrder: app.featuredOrder,
      published: true,
    };

    if (existing.docs[0]?.id) {
      await payload.update({
        collection: 'site-app-records',
        id: String(existing.docs[0].id),
        data: fields,
      });
      updated += 1;
      continue;
    }

    await payload.create({
      collection: 'site-app-records',
      data: fields,
    });
    created += 1;
  }

  console.log(`[site-apps:seed] ${created} created, ${updated} updated`);
  process.exit(0);
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[site-apps:seed] failed: ${message}`);
  process.exit(1);
});
