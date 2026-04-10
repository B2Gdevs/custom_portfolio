/** Stable string from thrown values in catch blocks and worker boundaries. */
export function unknownErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** For script stderr: prefer stack when present (matches previous `stack || message` pattern). */
export function unknownErrorMessageWithStack(error: unknown): string {
  return error instanceof Error ? error.stack || error.message : String(error);
}

/**
 * Visitor-facing UI: use `Error.message` when the throw is an `Error`; otherwise show a fixed
 * fallback string (avoid dumping `String(nonError)` into the UI).
 */
export function errorMessageOrFallback(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
