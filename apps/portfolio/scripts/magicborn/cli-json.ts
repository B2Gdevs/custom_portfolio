/**
 * Shared JSON vs stderr exit patterns for `magicborn` portfolio handler.
 */
import { unknownErrorMessage } from '@/lib/unknown-error';

export function exitJsonError(
  wantJson: boolean,
  plainMessage: string,
  jsonBody: Record<string, unknown>,
): never {
  if (wantJson) {
    console.log(JSON.stringify({ ok: false, ...jsonBody, message: plainMessage }, null, 2));
  } else {
    console.error(plainMessage);
  }
  process.exit(1);
}

/** JSON stderr exit when plain mode uses a custom handler (e.g. `ui.failure`). */
export function exitJsonErrorOr(
  wantJson: boolean,
  plainMessage: string,
  jsonBody: Record<string, unknown>,
  onPlain: () => void,
): never {
  if (wantJson) {
    console.log(JSON.stringify({ ok: false, ...jsonBody, message: plainMessage }, null, 2));
  } else {
    onPlain();
  }
  process.exit(1);
}

/** `{ ok: false, error: "<freeform>" }` — used when there is no stable `error` code. */
export function exitJsonErrorField(wantJson: boolean, errorContent: string): never {
  if (wantJson) {
    console.log(JSON.stringify({ ok: false, error: errorContent }, null, 2));
  } else {
    console.error(errorContent);
  }
  process.exit(1);
}

/** Catch helper: same shape as many `e instanceof Error ? e.message : String(e)` exits. */
export function exitJsonFromUnknown(wantJson: boolean, e: unknown, jsonErrorCode: string): never {
  const message = unknownErrorMessage(e);
  exitJsonError(wantJson, message, { error: jsonErrorCode });
}
