import { parseArgs } from 'node:util';
import { getAllContentEntries } from '@/lib/content';
import { createMagicbornCli } from '@/lib/magicborn/magicborn-cli-ui';
import { SITE_APP_SEED_RECORDS } from '@/lib/site-app-registry';
import { runSiteAppsWorker } from '@/lib/site-apps-worker-runner';

export async function runAppList(flagArgs: string[]): Promise<void> {
  const { values } = parseArgs({
    args: flagArgs,
    options: { json: { type: 'boolean', default: false } },
    strict: true,
    allowPositionals: false,
  });
  type AppSource = 'payload' | 'cms_empty' | 'cms_error';
  let source: AppSource = 'cms_error';
  let rows: Array<{ id: string; title: string; href: string }> = [];
  let detail: string | undefined;

  try {
    const result = await runSiteAppsWorker();
    const body = result.body as {
      ok?: boolean;
      apps?: Array<{ id?: string; title?: string; href?: string }>;
      loadError?: string | null;
    };

    if (body?.ok === true && Array.isArray(body.apps)) {
      const mapped = body.apps
        .filter(
          (a): a is { id: string; title: string; href: string } =>
            typeof a?.id === 'string' && typeof a?.title === 'string' && typeof a?.href === 'string',
        )
        .map((a) => ({ id: a.id, title: a.title, href: a.href }));
      rows = mapped;
      source = mapped.length > 0 ? 'payload' : 'cms_empty';
    } else {
      source = 'cms_error';
      detail =
        typeof body?.loadError === 'string' && body.loadError.trim()
          ? body.loadError.trim()
          : 'Worker returned ok=false or missing apps array.';
    }
  } catch (e) {
    source = 'cms_error';
    detail = e instanceof Error ? e.message : String(e);
  }

  if (values.json === true) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          source,
          apps: rows,
          ...(detail ? { error: detail } : {}),
          seedIds: SITE_APP_SEED_RECORDS.map((a) => a.id),
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  const isCli = process.env.MAGICBORN_CLI === '1';
  if (isCli) {
    createMagicbornCli(true).banner('list', 'app');
    console.log(`Site apps (source: ${source})`);
    if (detail) {
      console.log(`Detail: ${detail}`);
    }
    console.log('─'.repeat(50));
  }
  for (const r of rows) {
    console.log(`${r.id}\t${r.title}\t${r.href}`);
  }
  if (rows.length === 0 && isCli) {
    console.log(
      '(no published site-app-records — run `pnpm site:seed:apps` with DB env, or check Payload.)',
    );
    console.log(`Seed ids (not shown as rows): ${SITE_APP_SEED_RECORDS.map((a) => a.id).join(', ')}`);
  }
  if (isCli) {
    console.log('');
    console.log('Tip: magicborn app generate --id <id> --prompt "…"');
  }
  process.exit(0);
}

export function runProjectList(flagArgs: string[]): void {
  const { values } = parseArgs({
    args: flagArgs,
    options: { json: { type: 'boolean', default: false } },
    strict: true,
    allowPositionals: false,
  });
  const entries = getAllContentEntries('projects');
  const rows = entries.map((e) => ({
    slug: e.slug,
    title: e.meta.title,
    href: e.href,
  }));
  if (values.json === true) {
    console.log(JSON.stringify({ ok: true, source: 'content', projects: rows }, null, 2));
    process.exit(0);
  }
  const isCli = process.env.MAGICBORN_CLI === '1';
  if (isCli) {
    createMagicbornCli(true).banner('list', 'project');
    console.log('Projects (source: content)');
    console.log('─'.repeat(50));
  }
  for (const r of rows) {
    console.log(`${r.slug}\t${r.title}\t${r.href}`);
  }
  if (isCli) {
    console.log('');
    console.log('Tip: magicborn project generate --id <slug> --prompt "…"');
  }
  process.exit(0);
}
