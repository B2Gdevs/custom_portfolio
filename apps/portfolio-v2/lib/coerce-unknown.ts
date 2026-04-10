/** `typeof value === 'boolean' ? value : null` */
export function unknownToBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

/** Finite numbers only; no string parsing. */
export function unknownToFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Finite number, or non-empty numeric string (via `Number()`). */
export function parseUnknownFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}
