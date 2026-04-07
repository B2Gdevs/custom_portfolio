import { parseArgs } from 'node:util';
import { createMagicbornCli } from '@/lib/magicborn/magicborn-cli-ui';
import {
  PAYLOAD_CLI_GENERATE_ALIASES,
  siteAppRecordFromFallback,
  upsertSiteAppRecordViaLocalPayload,
} from '@/lib/magicborn/payload-cli-generate';
import { getPayloadClient } from '@/lib/payload';
import { FALLBACK_SITE_APPS } from '@/lib/site-app-registry';
import { exitJsonError } from '../cli-json';

/** Payload discovery smoke: list collection slugs from this app's config (global-tooling-02-05). */
export async function runPayloadCollections(argv: string[]): Promise<void> {
  const wantJson = argv.includes('--json');
  const mod = await import('../../../payload.config');
  const cfg = await mod.default;
  const cols = (cfg.collections ?? []) as Array<{ slug?: string }>;
  const slugs = cols
    .map((c) => (typeof c?.slug === 'string' ? c.slug.trim() : ''))
    .filter(Boolean)
    .sort();
  if (wantJson) {
    console.log(
      JSON.stringify(
        { ok: true, source: 'apps/portfolio/payload.config.ts', collections: slugs },
        null,
        2,
      ),
    );
  } else {
    for (const s of slugs) {
      console.log(s);
    }
  }
  process.exit(0);
}

/** Payload site-app upsert via in-process Payload (same as seed scripts; PAYLOAD_SECRET + DB). */
export async function runPayloadAppGenerate(flagArgs: string[]): Promise<void> {
  const { values } = parseArgs({
    args: flagArgs,
    options: {
      slug: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
    },
    strict: true,
    allowPositionals: false,
  });

  const slug = (values.slug as string | undefined)?.trim();
  const dry = values['dry-run'] === true;
  const wantJson = values.json === true;
  const isCli = process.env.MAGICBORN_CLI === '1';

  const contract = {
    ok: true,
    command: 'payload app generate',
    alias: 'app',
    collection: PAYLOAD_CLI_GENERATE_ALIASES.app.collection,
    label: PAYLOAD_CLI_GENERATE_ALIASES.app.label,
    mechanism:
      'In-process getPayload() — same as scripts/seed-site-app-records.ts. No browser login, no Payload admin API keys.',
    env: {
      PAYLOAD_SECRET: 'Required (Payload config)',
      DATABASE_URL: 'Postgres (or sqlite file path when using sqlite provider)',
      PAYLOAD_DB_PROVIDER: 'postgres | sqlite (matches payload.config)',
    },
    flags: ['--slug <id>', '--dry-run', '--json'],
    bodySource:
      'When --slug matches a built-in registry id, fields are taken from FALLBACK_SITE_APPS; extend with explicit flags later.',
  };

  if (dry) {
    const body = slug ? siteAppRecordFromFallback(slug) : null;
    console.log(
      JSON.stringify(
        {
          ...contract,
          mode: 'dry-run',
          slug: slug ?? null,
          hasPayloadSecret: Boolean(process.env.PAYLOAD_SECRET?.trim()),
          hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
          exampleBody: body,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  if (!slug) {
    const msg = 'payload app generate: pass --slug <id> (registry id) or use --dry-run.';
    exitJsonError(wantJson, msg, { error: 'missing_slug' });
  }

  const body = siteAppRecordFromFallback(slug);
  if (!body) {
    const msg = `Unknown app slug "${slug}". Known registry ids: ${FALLBACK_SITE_APPS.map((a) => a.id).join(', ')}`;
    exitJsonError(wantJson, msg, { error: 'unknown_slug' });
  }

  let result: Awaited<ReturnType<typeof upsertSiteAppRecordViaLocalPayload>>;
  try {
    const payload = await getPayloadClient();
    result = await upsertSiteAppRecordViaLocalPayload(payload, { body, slug });
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : 'Failed to init Payload (check PAYLOAD_SECRET, DATABASE_URL, and provider env).';
    exitJsonError(wantJson, message, { error: 'payload_init' });
  }

  if (wantJson) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    if (isCli) {
      const ui = createMagicbornCli(true);
      ui.banner('generate · payload', 'app');
      ui.step(`${result.mode} ${PAYLOAD_CLI_GENERATE_ALIASES.app.collection} id=${result.id}`);
      ui.info('local Payload (DB + PAYLOAD_SECRET)');
    } else {
      console.log(`${result.mode} site-app-records id=${result.id}`);
    }
  } else if (!wantJson) {
    console.error(result.message);
  }
  process.exit(result.ok ? 0 : 1);
}
