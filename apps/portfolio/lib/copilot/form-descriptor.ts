import type { CollectionConfig, Field, Option } from 'payload';
import payloadConfig from '@/payload.config';
import { isCopilotReadCollectionAllowed } from '@/lib/copilot/copilot-read-allowlist';

export type CopilotFormFieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'date'
  | 'select'
  /** Present in schema but not editable in the minimal Ink panel — use Payload admin. */
  | 'unsupported';

export type CopilotFormFieldDescriptor = {
  name: string;
  kind: CopilotFormFieldKind;
  label: string;
  required: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
};

export type CopilotFormIntent = 'create' | 'update';

export type CopilotFormDescriptor = {
  collection: string;
  intent: CopilotFormIntent;
  /** For update flows */
  id?: string;
  title: string;
  fields: CopilotFormFieldDescriptor[];
};

function optionToLabelValue(opt: Option): { label: string; value: string } | null {
  if (typeof opt === 'string') {
    return { label: opt, value: opt };
  }
  if (opt && typeof opt === 'object' && 'value' in opt && typeof (opt as { value: string }).value === 'string') {
    const o = opt as { label?: string; value: string };
    return { label: o.label ?? o.value, value: o.value };
  }
  return null;
}

function mapSelectOptions(field: { options?: Option[] }): { label: string; value: string }[] | undefined {
  const raw = field.options;
  if (!raw || !Array.isArray(raw)) return undefined;
  return raw.map(optionToLabelValue).filter((x): x is { label: string; value: string } => x !== null);
}

/**
 * Map a single Payload field to a Copilot descriptor row (skips arrays, relationships, uploads).
 */
export function payloadFieldToDescriptor(field: Field, labelPrefix = ''): CopilotFormFieldDescriptor | null {
  if (!field || typeof field !== 'object' || !('type' in field) || !('name' in field)) {
    return null;
  }
  const name = String((field as { name: string }).name);
  const type = (field as { type: string }).type;
  const required = Boolean((field as { required?: boolean }).required);
  const defaultValue = (field as { defaultValue?: unknown }).defaultValue;
  const label =
    labelPrefix +
    (typeof (field as { label?: string }).label === 'string'
      ? (field as { label: string }).label
      : name);

  switch (type) {
    case 'text':
      return { name, kind: 'text', label, required, defaultValue };
    case 'textarea':
      return { name, kind: 'textarea', label, required, defaultValue };
    case 'richText':
      return { name, kind: 'textarea', label: `${label} (rich)`, required, defaultValue };
    case 'number':
      return { name, kind: 'number', label, required, defaultValue };
    case 'checkbox':
      return { name, kind: 'checkbox', label, required, defaultValue };
    case 'date':
      return { name, kind: 'date', label, required, defaultValue };
    case 'select': {
      const options = mapSelectOptions(field as { options?: Option[] });
      return { name, kind: 'select', label, required, defaultValue, options };
    }
    case 'array':
    case 'relationship':
    case 'upload':
    case 'point':
    case 'json':
    case 'code':
    case 'blocks':
      return {
        name,
        kind: 'unsupported',
        label: `${label} (${type})`,
        required,
      };
    default:
      return {
        name,
        kind: 'unsupported',
        label: `${label} (${type})`,
        required,
      };
  }
}

function flattenFields(fields: Field[] | undefined, depth: number): CopilotFormFieldDescriptor[] {
  if (!fields?.length || depth > 6) {
    return [];
  }
  const out: CopilotFormFieldDescriptor[] = [];
  for (const field of fields) {
    if (!field || typeof field !== 'object') continue;
    const f = field as Field & { type?: string; fields?: Field[]; tabs?: { fields: Field[] }[] };

    if (f.type === 'row' && Array.isArray(f.fields)) {
      out.push(...flattenFields(f.fields, depth + 1));
      continue;
    }
    if (f.type === 'group' && Array.isArray(f.fields)) {
      const prefix = typeof (f as { label?: string }).label === 'string' ? `${(f as { label: string }).label} › ` : '';
      out.push(...flattenFields(f.fields, depth + 1).map((row) => ({ ...row, label: prefix + row.label })));
      continue;
    }
    if (f.type === 'tabs' && Array.isArray(f.tabs)) {
      for (const tab of f.tabs) {
        out.push(...flattenFields(tab.fields, depth + 1));
      }
      continue;
    }
    if (f.type === 'collapsible' && Array.isArray(f.fields)) {
      out.push(...flattenFields(f.fields, depth + 1));
      continue;
    }

    const row = payloadFieldToDescriptor(field);
    if (row) {
      out.push(row);
    }
  }
  return out;
}

export function buildCopilotFormDescriptor(options: {
  collection: string;
  intent: CopilotFormIntent;
  id?: string;
}): CopilotFormDescriptor | null {
  const slug = options.collection.trim();
  if (!isCopilotReadCollectionAllowed(slug)) {
    return null;
  }

  const collections = (payloadConfig as { collections?: CollectionConfig[] }).collections ?? [];
  const col = collections.find((c) => c.slug === slug);
  if (!col) {
    return null;
  }

  const fields = flattenFields(col.fields, 0);
  const title =
    options.intent === 'update' && options.id
      ? `${col.labels?.singular ?? slug} · update ${options.id}`
      : `${col.labels?.singular ?? slug} · new record`;

  return {
    collection: slug,
    intent: options.intent,
    id: options.id,
    title,
    fields,
  };
}
