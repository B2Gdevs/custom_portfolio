import { readJsonFromStdin } from '@/lib/read-json-stdin';
import { unknownErrorMessageWithStack } from '@/lib/unknown-error';
import { maybeAutoLoginForDevelopment } from '@/lib/auth/session';
import {
  getReaderPersistedState,
  saveReaderPersistedState,
} from '@/lib/reader/reading-state';
import type { ReaderPersistedStateInput } from '@/lib/reader/reading-state-contract';

type ReaderStateWorkerInput =
  | {
      command: 'get';
      cookieHeader?: string;
      storageKey: string;
      contentHash: string;
    }
  | {
      command: 'save';
      cookieHeader?: string;
      input: ReaderPersistedStateInput;
    };

function createRequest(cookieHeader: string) {
  return new Request('http://localhost/api/reader/state', {
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
  const payload = await readJsonFromStdin<ReaderStateWorkerInput>();
  const prepared = await prepareCookieHeader(payload.cookieHeader ?? '');
  const request = createRequest(prepared.cookieHeader);

  if (payload.command === 'get') {
    const state = await getReaderPersistedState(
      {
        storageKey: payload.storageKey,
        contentHash: payload.contentHash,
      },
      request,
    );

    process.stdout.write(
      JSON.stringify({
        status: 200,
        body: {
          ok: true,
          state,
        },
        setCookie: prepared.setCookie,
      }),
    );
    return;
  }

  const state = await saveReaderPersistedState(payload.input, request);
  process.stdout.write(
    JSON.stringify({
      status: 200,
      body: {
        ok: true,
        state,
      },
      setCookie: prepared.setCookie,
    }),
  );
}

void main().catch((error) => {
  process.stderr.write(unknownErrorMessageWithStack(error));
  process.exit(1);
});
