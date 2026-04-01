/**
 * `magicborn openai` — probe OpenAI API with the standard key; list org projects with an admin key.
 * @see https://platform.openai.com/docs/api-reference/projects/list
 */

import { parseArgs } from 'node:util';
import { createMagicbornCli } from '@/lib/magicborn/magicborn-cli-ui';

const MODELS_URL = 'https://api.openai.com/v1/models';
const ORG_PROJECTS_URL = 'https://api.openai.com/v1/organization/projects';

export function maskOpenAiKey(key: string): string {
  const t = key.trim();
  if (!t) return '(empty)';
  if (t.length <= 12) return `${t.slice(0, 3)}…`;
  return `${t.slice(0, 7)}…${t.slice(-4)}`;
}

export function buildOpenAiStandardHeaders(apiKey: string): Headers {
  const h = new Headers({
    Authorization: `Bearer ${apiKey}`,
  });
  const org = process.env.OPENAI_ORGANIZATION?.trim();
  const proj = process.env.OPENAI_PROJECT?.trim();
  if (org) {
    h.set('OpenAI-Organization', org);
  }
  if (proj) {
    h.set('OpenAI-Project', proj);
  }
  return h;
}

function mapOpenAiModelCategory(id: string): 'image' | 'chat' | 'embedding' | 'video' | 'text' {
  const v = id.toLowerCase();
  if (v.includes('embedding')) return 'embedding';
  if (v.includes('image') || v.includes('dall-e')) return 'image';
  if (v.includes('sora') || v.includes('video')) return 'video';
  if (v.startsWith('gpt-') || v.includes('o1') || v.includes('o3') || v.includes('o4')) return 'chat';
  return 'text';
}

function pickStatusHeaders(res: Response): Record<string, string | undefined> {
  const names = [
    'openai-organization',
    'openai-project',
    'openai-processing-ms',
    'x-request-id',
    'x-ratelimit-limit-requests',
    'x-ratelimit-remaining-requests',
    'x-ratelimit-reset-requests',
  ];
  const out: Record<string, string | undefined> = {};
  for (const n of names) {
    out[n] = res.headers.get(n) ?? undefined;
  }
  return out;
}

type OrgProjectRow = {
  id: string;
  name: string;
  status: string;
  created_at: number;
  archived_at: number | null;
};

function readAdminKey(): string | undefined {
  return (
    process.env.OPENAI_ADMIN_KEY?.trim() ||
    process.env.OPENAI_ORG_ADMIN_KEY?.trim() ||
    undefined
  );
}

export async function runOpenAiCli(flagArgs: string[]): Promise<void> {
  const parsed = parseArgs({
    args: flagArgs,
    allowPositionals: true,
    strict: true,
    options: {
      json: { type: 'boolean', default: false },
      'include-archived': { type: 'boolean', default: false },
      limit: { type: 'string' },
      category: { type: 'string' },
    },
  });
  const positionals = parsed.positionals;
  const action = (positionals[0] ?? 'status').trim().toLowerCase();
  const json = parsed.values.json === true;
  const isCli = process.env.MAGICBORN_CLI === '1';

  if (action === 'help' || action === '--help' || action === '-h') {
    console.log(`Usage:
  magicborn openai status [--json]     Probe OPENAI_API_KEY against /v1/models; show headers + counts
  magicborn openai models [--json] [--category <image|chat|embedding|video|text>]  List model ids (same key as status)
  magicborn openai projects [--json] [--include-archived] [--limit <1-100>]  List org projects (needs OPENAI_ADMIN_KEY)

Env:
  OPENAI_API_KEY          Standard API key (required for status/models)
  OPENAI_ORGANIZATION     Optional org id → OpenAI-Organization header
  OPENAI_PROJECT          Optional project id → OpenAI-Project header
  OPENAI_ADMIN_KEY        Admin key for GET /v1/organization/projects (alias: OPENAI_ORG_ADMIN_KEY)
`);
    process.exit(0);
  }

  if (action === 'status') {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      console.error('OPENAI_API_KEY is required for `magicborn openai status`.');
      process.exit(1);
    }
    const headers = buildOpenAiStandardHeaders(apiKey);
    const res = await fetch(MODELS_URL, { headers });
    const body = (await res.json().catch(() => null)) as
      | { data?: unknown[]; error?: { message?: string; type?: string } }
      | null;
    const count = Array.isArray(body?.data) ? body.data.length : 0;
    const meta = pickStatusHeaders(res);
    const envHints = {
      OPENAI_ORGANIZATION: Boolean(process.env.OPENAI_ORGANIZATION?.trim()),
      OPENAI_PROJECT: Boolean(process.env.OPENAI_PROJECT?.trim()),
    };
    const payload = {
      ok: res.ok,
      httpStatus: res.status,
      apiKey: maskOpenAiKey(apiKey),
      requestHeadersSent: {
        'OpenAI-Organization': envHints.OPENAI_ORGANIZATION,
        'OpenAI-Project': envHints.OPENAI_PROJECT,
      },
      modelCount: count,
      responseHeaders: meta,
      error: !res.ok ? body?.error?.message ?? `HTTP ${res.status}` : undefined,
    };
    if (json) {
      console.log(JSON.stringify(payload, null, 2));
      process.exit(res.ok ? 0 : 1);
    }
    if (isCli) {
      createMagicbornCli(true).banner('magicborn openai status');
    }
    console.log(`API key (masked): ${payload.apiKey}`);
    console.log(
      `Request scoping: OpenAI-Organization=${envHints.OPENAI_ORGANIZATION ? 'set' : 'not set'}, OpenAI-Project=${envHints.OPENAI_PROJECT ? 'set' : 'not set'}`,
    );
    console.log(`GET /v1/models → ${res.status} (${count} models)`);
    if (!res.ok) {
      console.error(payload.error ?? 'Request failed');
      process.exit(1);
    }
    console.log('Response headers (subset):');
    for (const [k, v] of Object.entries(meta)) {
      if (v) {
        console.log(`  ${k}: ${v}`);
      }
    }
    process.exit(0);
  }

  if (action === 'models') {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      console.error('OPENAI_API_KEY is required for `magicborn openai models`.');
      process.exit(1);
    }
    const categoryFilter = (parsed.values.category as string | undefined)?.trim().toLowerCase();
    const headers = buildOpenAiStandardHeaders(apiKey);
    const res = await fetch(MODELS_URL, { headers });
    const body = (await res.json().catch(() => null)) as
      | { data?: Array<{ id?: string }>; error?: { message?: string } }
      | null;
    if (!res.ok) {
      const msg = body?.error?.message ?? `OpenAI models API failed (${res.status})`;
      if (json) {
        console.log(JSON.stringify({ ok: false, httpStatus: res.status, error: msg }, null, 2));
      } else {
        console.error(msg);
      }
      process.exit(1);
    }
    const ids = (body?.data ?? []).map((m) => m.id).filter((id): id is string => typeof id === 'string');
    let rows = ids
      .map((id) => ({ id, category: mapOpenAiModelCategory(id) }))
      .sort((a, b) => a.id.localeCompare(b.id));
    if (categoryFilter && ['image', 'chat', 'embedding', 'video', 'text'].includes(categoryFilter)) {
      rows = rows.filter((r) => r.category === categoryFilter);
    }
    if (json) {
      console.log(JSON.stringify({ ok: true, count: rows.length, models: rows }, null, 2));
      process.exit(0);
    }
    if (isCli) {
      createMagicbornCli(true).banner('magicborn openai models');
      console.log(`${rows.length} models (use --json for full list)`);
      console.log('─'.repeat(72));
    }
    for (const r of rows) {
      console.log(`${r.category}\t${r.id}`);
    }
    process.exit(0);
  }

  if (action === 'projects') {
    const adminKey = readAdminKey();
    if (!adminKey) {
      const msg =
        'OPENAI_ADMIN_KEY is required for `magicborn openai projects` (Organization Admin API key). ' +
        'See: https://platform.openai.com/docs/api-reference/projects/list';
      if (json) {
        console.log(JSON.stringify({ ok: false, error: msg }, null, 2));
      } else {
        console.error(msg);
      }
      process.exit(1);
    }
    const limitRaw = (parsed.values.limit as string | undefined)?.trim();
    let limit = 20;
    if (limitRaw) {
      limit = Math.min(100, Math.max(1, Number(limitRaw) || 20));
    }
    const includeArchived = parsed.values['include-archived'] === true;
    const url = new URL(ORG_PROJECTS_URL);
    url.searchParams.set('limit', String(limit));
    if (includeArchived) {
      url.searchParams.set('include_archived', 'true');
    }
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${adminKey}`,
        'Content-Type': 'application/json',
      },
    });
    const body = (await res.json().catch(() => null)) as
      | {
          data?: OrgProjectRow[];
          has_more?: boolean;
          error?: { message?: string };
        }
      | null;
    if (!res.ok) {
      const msg = body?.error?.message ?? `Organization projects API failed (${res.status})`;
      if (json) {
        console.log(JSON.stringify({ ok: false, httpStatus: res.status, error: msg }, null, 2));
      } else {
        console.error(msg);
      }
      process.exit(1);
    }
    const data = (body?.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      created_at: p.created_at,
      archived_at: p.archived_at ?? null,
    }));
    if (json) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            has_more: body?.has_more ?? false,
            projects: data,
          },
          null,
          2,
        ),
      );
      process.exit(0);
    }
    if (isCli) {
      createMagicbornCli(true).banner('magicborn openai projects');
      console.log(`Organization projects (${data.length} rows, admin key masked: ${maskOpenAiKey(adminKey)})`);
      console.log('─'.repeat(72));
    }
    for (const p of data) {
      const created = new Date(p.created_at * 1000).toISOString();
      console.log(`${p.id}\t${p.status}\t${created}\t${p.name}`);
    }
    if (body?.has_more) {
      console.log('\nMore pages available; re-run with a higher --limit or use the API cursor `after`.');
    }
    process.exit(0);
  }

  console.error(
    `Unknown openai action "${action}". Use: status | models | projects (or magicborn openai help)`,
  );
  process.exit(1);
}
