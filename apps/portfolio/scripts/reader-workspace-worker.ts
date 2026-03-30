import { getReaderWorkspaceBootstrap } from '@/lib/reader/workspace-bootstrap';
import { maybeAutoLoginForDevelopment } from '@/lib/auth/session';

type WorkerInput = {
  cookieHeader?: string;
};

async function readJsonFromStdin(): Promise<WorkerInput> {
  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as WorkerInput;
}

async function main() {
  const input = await readJsonFromStdin();
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

  process.stdout.write(
    JSON.stringify({
      status: 200,
      body: {
        ok: true,
        workspace,
      },
      setCookie,
    }),
  );
}

void main().catch((error) => {
  process.stderr.write(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
