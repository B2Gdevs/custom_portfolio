import type { CopilotFormDescriptor, CopilotFormFieldKind } from '@/lib/copilot/form-descriptor';

const EDITABLE_KINDS: CopilotFormFieldKind[] = [
  'text',
  'textarea',
  'number',
  'checkbox',
  'date',
  'select',
];

/**
 * Keep only scalar fields the form descriptor marks as editable (not `unsupported`).
 */
export function sanitizeCopilotCreateData(
  descriptor: CopilotFormDescriptor,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const allowed = new Map(
    descriptor.fields.filter((f) => EDITABLE_KINDS.includes(f.kind)).map((f) => [f.name, f.kind]),
  );
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const kind = allowed.get(key);
    if (!kind) continue;
    if (value === undefined) continue;
    if (kind === 'number' && typeof value === 'string') {
      const n = Number(value);
      if (Number.isFinite(n)) out[key] = n;
      continue;
    }
    if (kind === 'checkbox' && typeof value === 'string') {
      out[key] = value === 'true' || value === '1';
      continue;
    }
    out[key] = value;
  }
  return out;
}
