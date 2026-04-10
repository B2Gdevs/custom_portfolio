/** Narrow `unknown` payload fields to `string | null` (string or number only). */
export function coerceUnknownToString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

/** Only actual strings; numbers and other types become `null` (no coercion). */
export function unknownToStringStrict(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

/** `coerceUnknownToString` then trim; `null` if unset or whitespace-only. */
export function normalizeOptionalTrimmedString(value: unknown): string | null {
  const normalized = coerceUnknownToString(value)?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

/** `unknownToStringStrict` then trim; `null` if unset or whitespace-only (no number coercion). */
export function normalizeOptionalTrimmedStringStrict(value: unknown): string | null {
  const normalized = unknownToStringStrict(value)?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}
