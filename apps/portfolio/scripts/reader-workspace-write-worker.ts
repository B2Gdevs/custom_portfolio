import { maybeAutoLoginForDevelopment } from '@/lib/auth/session';
import { saveReaderWorkspaceSettings, uploadReaderLibraryEpub } from '@/lib/reader/workspace-write';
import type { ReaderLibraryUploadInput, ReaderWorkspaceSettingsInput } from '@/lib/reader/workspace-write-contract';

type WorkerInput =
  | {
      command: 'save-settings';
      cookieHeader?: string;
      input: ReaderWorkspaceSettingsInput;
    }
  | {
      command: 'upload-epub';
      cookieHeader?: string;
      input: ReaderLibraryUploadInput;
    };

async function readJsonFromStdin(): Promise<WorkerInput> {
  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as WorkerInput;
}

function createRequest(cookieHeader: string) {
  return new Request('http://localhost/api/reader/workspace/write', {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}

async function prepareCookieHeader(cookieHeader: string) {
  let nextCookieHeader = cookieHeader;
  let setCookie: string | undefined;

  const autoLoginResponse = await maybeAutoLoginForDevelopment(createRequest(cookieHeader));
  if (autoLoginResponse) {
    setCookie = autoLoginResponse.headers.get('set-cookie') ?? undefined;
    if (setCookie) {
      nextCookieHeader = setCookie.split(';', 1)[0] ?? nextCookieHeader;
    }
  }

  return {
    cookieHeader: nextCookieHeader,
    setCookie,
  };
}

async function main() {
  const payload = await readJsonFromStdin();
  const prepared = await prepareCookieHeader(payload.cookieHeader ?? '');
  const request = createRequest(prepared.cookieHeader);

  if (payload.command === 'save-settings') {
    const settings = await saveReaderWorkspaceSettings(payload.input, request);
    if (!settings) {
      process.stdout.write(
        JSON.stringify({
          status: 403,
          body: {
            ok: false,
            error: 'Reader settings write access denied.',
          },
          setCookie: prepared.setCookie,
        }),
      );
      return;
    }

    process.stdout.write(
      JSON.stringify({
        status: 200,
        body: {
          ok: true,
          settings,
        },
        setCookie: prepared.setCookie,
      }),
    );
    return;
  }

  const record = await uploadReaderLibraryEpub(payload.input, request);
  if (!record) {
    process.stdout.write(
      JSON.stringify({
        status: 403,
        body: {
          ok: false,
          error: 'Reader upload access denied.',
        },
        setCookie: prepared.setCookie,
      }),
    );
    return;
  }

  process.stdout.write(
    JSON.stringify({
      status: 200,
      body: {
        ok: true,
        record,
      },
      setCookie: prepared.setCookie,
    }),
  );
}

void main().catch((error) => {
  process.stderr.write(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
