'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type EnvEntry = { key: string; value: string };

type EnvPayload = {
  generatedAt: string;
  node: string;
  platform: string;
  cwd: string;
  pid: number;
  monorepoRootEnvMerged?: boolean;
  count: number;
  entries: EnvEntry[];
  hints?: {
    siteChatRequiresOpenAiKey?: boolean;
    siteChatDisabledIf?: string;
    siteChatShowUiWithoutKey?: string;
  };
  error?: string;
};

export default function AdminEnvPage() {
  const [data, setData] = useState<EnvPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/env')
      .then((r) => r.json())
      .then((body: EnvPayload) => setData(body))
      .finally(() => setLoading(false));
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-lg text-text-muted">Environment inspector is only available in development.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href="/admin"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-primary"
      >
        <ArrowLeft size={16} />
        Admin
      </Link>
      <h1 className="font-display text-4xl text-primary">Process environment</h1>
      <p className="mt-3 max-w-2xl text-text-muted">
        Values from the Next.js server process (secrets masked). Repo-root <code className="font-mono">.env</code> is
        merged in <code className="font-mono">next.config.ts</code> via <code className="font-mono">lib/monorepo-env.ts</code>{' '}
        — you do not need a copy under <code className="font-mono">apps/portfolio</code>. Restart dev after changing env
        files. Use this to verify{' '}
        <code className="rounded bg-dark-alt px-1.5 py-0.5 font-mono text-xs">OPENAI_API_KEY</code>,{' '}
        <code className="rounded bg-dark-alt px-1.5 py-0.5 font-mono text-xs">NEXT_PUBLIC_SITE_CHAT</code>, and
        storage keys.
      </p>
      {data?.hints ? (
        <p className="mt-4 text-sm text-text-muted">
          Site chat: requires OPENAI_API_KEY for API calls; disable with{' '}
          {data.hints.siteChatDisabledIf ?? 'NEXT_PUBLIC_SITE_CHAT=0'}. Show launcher without key:{' '}
          {data.hints.siteChatShowUiWithoutKey ?? 'NEXT_PUBLIC_SITE_CHAT_SHOW=1'}.
        </p>
      ) : null}

      {loading ? (
        <p className="mt-10 text-text-muted">Loading…</p>
      ) : data?.error ? (
        <p className="mt-10 text-destructive">{data.error}</p>
      ) : data ? (
        <div className="mt-10 overflow-x-auto rounded-xl border border-border/80 bg-dark-alt/40">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border/80 text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3 font-medium">Variable</th>
                <th className="px-4 py-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/40 bg-muted/20">
                <td className="px-4 py-2 font-mono text-xs text-accent">_meta.node</td>
                <td className="px-4 py-2 font-mono text-xs">{data.node}</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-2 font-mono text-xs text-accent">_meta.platform</td>
                <td className="px-4 py-2 font-mono text-xs">{data.platform}</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-2 font-mono text-xs text-accent">_meta.cwd</td>
                <td className="px-4 py-2 font-mono text-xs break-all">{data.cwd}</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-2 font-mono text-xs text-accent">_meta.pid</td>
                <td className="px-4 py-2 font-mono text-xs">{data.pid}</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-2 font-mono text-xs text-accent">_meta.generatedAt</td>
                <td className="px-4 py-2 font-mono text-xs">{data.generatedAt}</td>
              </tr>
              <tr className="border-b border-border/40">
                <td className="px-4 py-2 font-mono text-xs text-accent">_meta.monorepoRootEnvMerged</td>
                <td className="px-4 py-2 font-mono text-xs">
                  {data.monorepoRootEnvMerged === true
                    ? 'yes (repo root .env applied)'
                    : data.monorepoRootEnvMerged === false
                      ? 'no — restart dev; check next.config.ts + lib/monorepo-env.ts'
                      : '—'}
                </td>
              </tr>
              {data.entries.map((row) => (
                <tr key={row.key} className="border-b border-border/30 hover:bg-muted/10">
                  <td className="whitespace-nowrap px-4 py-1.5 font-mono text-xs text-primary">{row.key}</td>
                  <td className="whitespace-pre-wrap break-all px-4 py-1.5 font-mono text-xs text-text-muted">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
