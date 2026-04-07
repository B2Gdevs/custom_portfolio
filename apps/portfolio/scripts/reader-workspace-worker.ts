import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readJsonFromStdin } from '@/lib/read-json-stdin';
import { unknownErrorMessageWithStack } from '@/lib/unknown-error';
import { getReaderWorkspaceBootstrap } from '@/lib/reader/workspace-bootstrap';
import { maybeAutoLoginForDevelopment } from '@/lib/auth/session';

const RESULT_MARKER_PREFIX = 'READER_WORKSPACE_JSON_PATH=';

type WorkerInput = {
  cookieHeader?: string;
};

async function main() {
  const input = await readJsonFromStdin<WorkerInput>({});
  let setCookie: string | undefined;
  let cookieHeader = input.cookieHeader ?? '';

  const request = new Request('http://localhost/api/reader/workspace', {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });

  const autoLoginResponse = await maybeAutoLoginForDevelopment(request);
  if (autoLoginResponse) {
    setCookie = autoLoginResponse.headers.get('set-cookie') ?? undefined;
    if (setCookie) {
      cookieHeader = setCookie.split(';', 1)[0] ?? cookieHeader;
    }
  }

  const workspace = await getReaderWorkspaceBootstrap(
    new Request('http://localhost/api/reader/workspace', {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    }),
  );

  const payload = JSON.stringify({
    status: 200,
    body: {
      ok: true,
      workspace,
    },
    setCookie,
  });

  /** Write to a temp file and emit only a single-line marker on stdout so stray logs (e.g. model pull spinners) cannot corrupt JSON. */
  const outPath = join(
    tmpdir(),
    `reader-workspace-${process.pid}-${Date.now()}.json`,
  );
  writeFileSync(outPath, payload, 'utf8');
  process.stdout.write(`${RESULT_MARKER_PREFIX}${outPath}\n`);
}

void main().catch((error) => {
  process.stderr.write(unknownErrorMessageWithStack(error));
  process.exit(1);
});
