import { readJsonFromStdin } from '@/lib/read-json-stdin';
import { unknownErrorMessageWithStack } from '@/lib/unknown-error';
import { maybeAutoLoginForDevelopment } from '@/lib/auth/session';
import { getListenCatalogBootstrap } from '@/lib/listen-catalog-bootstrap';

type WorkerInput = {
  cookieHeader?: string;
};

async function main() {
  const input = await readJsonFromStdin<WorkerInput>({});
  let setCookie: string | undefined;
  let cookieHeader = input.cookieHeader ?? '';

  const request = new Request('http://localhost/listen', {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });

  const autoLoginResponse = await maybeAutoLoginForDevelopment(request);
  if (autoLoginResponse) {
    setCookie = autoLoginResponse.headers.get('set-cookie') ?? undefined;
    if (setCookie) {
      cookieHeader = setCookie.split(';', 1)[0] ?? cookieHeader;
    }
  }

  const bootstrap = await getListenCatalogBootstrap(
    new Request('http://localhost/listen', {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    }),
  );

  process.stdout.write(
    JSON.stringify({
      status: 200,
      body: {
        ok: true,
        bootstrap,
      },
      setCookie,
    }),
  );
}

void main().catch((error) => {
  process.stderr.write(unknownErrorMessageWithStack(error));
  process.exit(1);
});
