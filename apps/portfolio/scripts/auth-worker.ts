import { runLoginCommand, runSessionCommand } from '@/lib/auth/auth-commands';
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
  return runSessionCommand(request);
}

async function handleLogin(payload: Record<string, unknown>) {
  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';
  return runLoginCommand(email, password);
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
