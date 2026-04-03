import { describe, expect, it } from 'vitest';
import { sanitizeCopilotCreateData } from '@/lib/copilot/sanitize-copilot-create-data';
import type { CopilotFormDescriptor } from '@/lib/copilot/form-descriptor';

const base: CopilotFormDescriptor = {
  collection: 'project-records',
  intent: 'create',
  title: 'T',
  fields: [
    { name: 'slug', kind: 'text', label: 'Slug', required: true },
    { name: 'note', kind: 'unsupported', label: 'N', required: false },
  ],
};

describe('sanitizeCopilotCreateData', () => {
  it('drops unsupported and unknown keys', () => {
    expect(
      sanitizeCopilotCreateData(base, {
        slug: 'a',
        note: 'x',
        extra: 1,
      }),
    ).toEqual({ slug: 'a' });
  });

  it('coerces number from string', () => {
    const d: CopilotFormDescriptor = {
      ...base,
      fields: [{ name: 'n', kind: 'number', label: 'N', required: false }],
    };
    expect(sanitizeCopilotCreateData(d, { n: '42' })).toEqual({ n: 42 });
  });
});
