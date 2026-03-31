import { getViewerFeatureAccess } from '@/lib/auth/permissions';
import {
  getSessionViewer,
  loginWithCredentials,
  maybeAutoLoginForDevelopment,
} from '@/lib/auth/session';
import { loadScriptEnv } from './load-script-env';

loadScriptEnv();

function decodePayload(raw: string | undefined) {
  if (!raw) return {};
  return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Record<
    string,
    unknown
  >;
}

async function handleSession(payload: Record<string, unknown>) {
  const cookieHeader =
    typeof payload.cookieHeader === 'string' ? payload.cookieHeader : '';
  const request = new Request('http://localhost/api/auth/session', {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });

  const autoLoginResponse = await maybeAutoLoginForDevelopment(request);
  if (autoLoginResponse) {
    return {
      status: autoLoginResponse.status,
      body: await autoLoginResponse.json(),
      setCookie: autoLoginResponse.headers.get('set-cookie'),
    };
  }

  const viewer = await getSessionViewer(request);
  return {
    status: 200,
    body: {
      ok: true,
      session: getViewerFeatureAccess(viewer),
    },
    setCookie: null,
  };
}

async function handleLogin(payload: Record<string, unknown>) {
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';
  const response = await loginWithCredentials({ email, password });

  return {
    status: response.status,
    body: await response.json(),
    setCookie: response.headers.get('set-cookie'),
  };
}

async function main() {
  const command = process.argv[2];
  const payload = decodePayload(process.argv[3]);

  const result =
    command === 'login'
      ? await handleLogin(payload)
      : command === 'session'
        ? await handleSession(payload)
        : null;

  if (!result) {
    throw new Error(`unknown auth worker command: ${command ?? '<missing>'}`);
  }

  process.stdout.write(JSON.stringify(result));
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack || error.message : String(error);
  process.stderr.write(message);
  process.exitCode = 1;
});
