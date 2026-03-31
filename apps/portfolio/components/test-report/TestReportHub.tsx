import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

export type TestReportHubFileRow = {
  short: string;
  st: 'passed' | 'failed';
  p: number;
  f: number;
};

export type TestReportHubFailure = {
  file: string;
  title: string;
  msg: string;
};

export type TestReportHubProps = {
  /** ISO timestamp when the HTML file was written */
  builtAt: string;
  success: boolean;
  total: number;
  passed: number;
  failed: number;
  pending: number;
  suitePass: number;
  suiteFail: number;
  passPct: number;
  failPct: number;
  fileRows: TestReportHubFileRow[];
  failures: TestReportHubFailure[];
  envRows: Array<{ k: string; v: string }>;
  envMeta?: { node?: string; platform?: string; generatedAt?: string };
};

function StatCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wider">{title}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

export function TestReportHub({
  builtAt,
  success,
  total,
  passed,
  failed,
  pending,
  suitePass,
  suiteFail,
  passPct,
  failPct,
  fileRows,
  failures,
  envRows,
  envMeta,
}: TestReportHubProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Unit test report hub</h1>
          <p className="text-sm text-muted-foreground">
            Generated for <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@portfolio/app</code> · Vitest
            JSON + masked env snapshot · {builtAt}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Outcome">
            <div
              className={cn(
                'text-3xl font-bold tracking-tight',
                success ? 'text-green-500 dark:text-green-400' : 'text-destructive',
              )}
            >
              {success ? 'All passed' : 'Some failures'}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {total} tests · {passed} passed · {failed} failed
              {pending ? ` · ${pending} skipped` : ''}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Suites: {suitePass} passed · {suiteFail} failed
            </p>
            <div
              className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
              title={`Pass ${passPct}% / Fail ${failPct}%`}
            >
              <span className="h-full bg-green-500 dark:bg-green-400" style={{ width: `${passPct}%` }} />
              <span className="h-full bg-destructive" style={{ width: `${failPct}%` }} />
            </div>
          </StatCard>

          <StatCard title="Coverage (V8)">
            <p className="text-sm text-muted-foreground">
              Open the HTML report from <code className="font-mono text-xs">vitest run --coverage</code>:
            </p>
            <p className="mt-3">
              <a
                className="text-primary underline-offset-4 hover:underline"
                href="./coverage/index.html"
              >
                coverage/index.html
              </a>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Also: coverage/lcov.info for CI tools.</p>
          </StatCard>

          <StatCard title="Raw data">
            <p className="text-sm">
              <a className="text-primary underline-offset-4 hover:underline" href="./unit/vitest-results.json">
                vitest-results.json
              </a>
              <br />
              <a className="text-primary underline-offset-4 hover:underline" href="./unit/environment.json">
                environment.json
              </a>
            </p>
          </StatCard>
        </div>

        <Card className="shadow-sm">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl p-6 pb-0 [&::-webkit-details-marker]:hidden">
              <div>
                <CardTitle className="text-lg">Environment (masked)</CardTitle>
                <CardDescription className="mt-1">
                  Snapshot from the Vitest process — API keys and secrets show as hidden; long values truncate.
                </CardDescription>
              </div>
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <CardContent className="space-y-4 pt-4">
              {envRows.length > 0 ? (
                <>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Variable</th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {envRows.map((r) => (
                          <tr key={r.k} className="border-b border-border/80 last:border-0">
                            <td className="px-3 py-2 align-top font-mono text-xs">{r.k}</td>
                            <td className="max-w-[min(100vw,32rem)] break-all px-3 py-2 font-mono text-xs text-muted-foreground">
                              {r.v}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only variables present in <code className="font-mono">process.env</code> at the end of the test run
                    are listed. If a name is missing, it was not set for that process.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No environment.json found. Run a full report build.</p>
              )}
              {envMeta?.node ? (
                <p className="text-sm text-muted-foreground">
                  Node {envMeta.node}
                  {envMeta.platform ? ` · ${envMeta.platform}` : ''}
                  {envMeta.generatedAt ? ` · snapshot ${envMeta.generatedAt}` : ''}
                </p>
              ) : null}
            </CardContent>
          </details>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Test files</CardTitle>
          </CardHeader>
          <CardContent>
            {fileRows.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">File</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Passed</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">Failed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fileRows.map((r) => (
                      <tr
                        key={r.short}
                        className={cn(
                          'border-b border-border/80 last:border-0',
                          r.st === 'failed' && 'bg-destructive/5',
                        )}
                      >
                        <td className="px-3 py-2 font-mono text-xs">{r.short}</td>
                        <td className="px-3 py-2">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs',
                              r.st === 'failed' &&
                                'border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15',
                            )}
                          >
                            {r.st}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.p}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.f}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No vitest-results.json found.</p>
            )}
          </CardContent>
        </Card>

        {failures.length > 0 ? (
          <Card className="border-destructive/40 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-destructive">Failure details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {failures.map((f) => (
                <details key={`${f.file}-${f.title}`} className="rounded-lg border bg-muted/30">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                    <span className="text-foreground">{f.title}</span>{' '}
                    <span className="font-normal text-muted-foreground">{f.file}</span>
                  </summary>
                  <pre className="max-h-64 overflow-auto border-t bg-[oklch(0.12_0.01_40)] p-4 font-mono text-xs text-muted-foreground dark:bg-black/40">
                    {f.msg}
                  </pre>
                </details>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
