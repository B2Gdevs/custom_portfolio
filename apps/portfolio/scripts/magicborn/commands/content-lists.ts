import { parseArgs } from 'node:util';
import { getAllContentEntries } from '@/lib/content';
import { createMagicbornCli } from '@/lib/magicborn/magicborn-cli-ui';
import { FALLBACK_SITE_APPS } from '@/lib/site-app-registry';
import { runSiteAppsWorker } from '@/lib/site-apps-worker-runner';

export async function runAppList(flagArgs: string[]): Promise<void> {
  const { values } = parseArgs({
    args: flagArgs,
    options: { json: { type: 'boolean', default: false } },
    strict: true,
    allowPositionals: false,
  });
  let source: 'payload' | 'fallback' = 'fallback';
  let rows = FALLBACK_SITE_APPS.map((a) => ({
    id: a.id,
    title: a.title,
    href: a.href,
  }));
  try {
    const result = await runSiteAppsWorker();
    const body = result.body as { ok?: boolean; apps?: Array<{ id?: string; title?: string; href?: string }> };
    if (body?.ok && Array.isArray(body.apps) && body.apps.length > 0) {
      rows = body.apps
        .filter(
          (a): a is { id: string; title: string; href: string } =>
            typeof a?.id === 'string' && typeof a?.title === 'string' && typeof a?.href === 'string',
        )
        .map((a) => ({ id: a.id, title: a.title, href: a.href }));
      source = 'payload';
    }
  } catch {
    source = 'fallback';
  }
  if (values.json === true) {
    console.log(JSON.stringify({ ok: true, source, apps: rows }, null, 2));
    process.exit(0);
  }
  const isCli = process.env.MAGICBORN_CLI === '1';
  if (isCli) {
    createMagicbornCli(true).banner('list', 'app');
    console.log(`Site apps (source: ${source})`);
    console.log('─'.repeat(50));
  }
  for (const r of rows) {
    console.log(`${r.id}\t${r.title}\t${r.href}`);
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
