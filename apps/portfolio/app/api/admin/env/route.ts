import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sensitiveKey(key: string): boolean {
  return (
    /SECRET|PASSWORD|TOKEN|PRIVATE|CREDENTIAL|BEARER/i.test(key) ||
    /API_KEY$|_KEY$/i.test(key) ||
    /ACCESS_KEY|AUTH_SECRET|CLIENT_SECRET/i.test(key) ||
    /^PAYLOAD_SECRET$/i.test(key) ||
    /^DATABASE_URL$/i.test(key) ||
    /^OPENAI_API_KEY$/i.test(key) ||
    /^ADMIN_BASIC_AUTH_PASSWORD$/i.test(key)
  );
}

function maskValue(key: string, raw: string | undefined): string {
  if (raw === undefined) return '(unset)';
  if (raw === '') return '(empty)';
  if (sensitiveKey(key)) {
    return raw.length > 0 ? '[set — value hidden]' : '(empty)';
  }
  if (raw.length > 240) {
    return `${raw.slice(0, 237)}…`;
  }
  return raw;
}

/**
 * Development-only: masked snapshot of process.env for debugging (same process as Next).
 */
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 });
  }

  const keys = Object.keys(process.env).sort();
  const entries = keys.map((key) => ({
    key,
    value: maskValue(key, process.env[key]),
  }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    node: process.version,
    platform: process.platform,
    cwd: process.cwd(),
    pid: process.pid,
    /** Set by `applyMonorepoEnvFromRepoRoot` when `next.config` loads. */
    monorepoRootEnvMerged: process.env.__MONOREPO_ROOT_ENV_LOADED === '1',
    count: entries.length,
    entries,
    /** Hints for chat shell visibility (matches app/layout.tsx). */
    hints: {
      siteChatRequiresOpenAiKey: true,
      siteChatDisabledIf: 'NEXT_PUBLIC_SITE_CHAT=0',
      siteChatShowUiWithoutKey: 'NEXT_PUBLIC_SITE_CHAT_SHOW=1',
    },
  });
}
