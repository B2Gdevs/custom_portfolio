import { COPILOT_READ_COLLECTION_SLUGS } from '@/lib/copilot/copilot-read-allowlist';

/** OpenAI tool: load a schema snapshot for create/update (read-only metadata for the model + Ink). */
export const COPILOT_FORM_OPENAI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'copilot_open_form',
      description:
        'Load an allowlisted Payload collection form schema (field names, types, required). Use before suggesting structured create/update; heavy fields (arrays, uploads, relations) appear as unsupported — operator uses Payload admin for those.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          collection: {
            type: 'string',
            enum: [...COPILOT_READ_COLLECTION_SLUGS],
          },
          intent: { type: 'string', enum: ['create', 'update'] },
          id: {
            type: 'string',
            description: 'Document id when intent is update',
          },
        },
        required: ['collection', 'intent'],
      },
    },
  },
];
