import type { Payload, Where } from 'payload';
import { getPayloadClient } from '@/lib/payload';
import { unknownErrorMessage } from '@/lib/unknown-error';
import {
  COPILOT_READ_LIMITS,
  COPILOT_READ_COLLECTION_SLUGS,
  isCopilotReadCollectionAllowed,
} from './copilot-read-allowlist';

export type CopilotReadErrorCode =
  | 'collection_not_allowed'
  | 'invalid_input'
  | 'not_found'
  | 'payload_error';

export type CopilotFindInput = {
  collection: string;
  /** Payload `where` clause; omit for unconstrained list (still capped by limit). */
  where?: Where;
  limit?: unknown;
  page?: unknown;
  depth?: unknown;
  /** Payload `sort` string, e.g. "-updatedAt" */
  sort?: string;
};

export type CopilotFindByIdInput = {
  collection: string;
  id: string;
  depth?: unknown;
};

export type CopilotReadSuccessFind = {
  ok: true;
  operation: 'find';
  collection: string;
  result: {
    docs: unknown[];
    totalDocs: number;
    limit: number;
    page: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type CopilotReadSuccessFindById = {
  ok: true;
  operation: 'findByID';
  collection: string;
  result: {
    doc: unknown | null;
  };
};

export type CopilotReadFailure = {
  ok: false;
  operation: 'find' | 'findByID';
  collection: string;
  error: CopilotReadErrorCode;
  message: string;
};

export type CopilotReadResult = CopilotReadSuccessFind | CopilotReadSuccessFindById | CopilotReadFailure;

export function normalizeCopilotLimit(limit: unknown): number {
  const raw = typeof limit === 'number' ? limit : typeof limit === 'string' ? Number(limit) : NaN;
  if (!Number.isFinite(raw) || raw < 1) {
    return COPILOT_READ_LIMITS.defaultLimit;
  }
  return Math.min(Math.floor(raw), COPILOT_READ_LIMITS.maxLimit);
}

export function normalizeCopilotPage(page: unknown): number {
  const raw = typeof page === 'number' ? page : typeof page === 'string' ? Number(page) : NaN;
  if (!Number.isFinite(raw) || raw < 1) {
    return 1;
  }
  return Math.min(Math.floor(raw), COPILOT_READ_LIMITS.maxPage);
}

export function normalizeCopilotDepth(depth: unknown): number {
  const raw = typeof depth === 'number' ? depth : typeof depth === 'string' ? Number(depth) : NaN;
  if (!Number.isFinite(raw) || raw < 0) {
    return 0;
  }
  return Math.min(Math.floor(raw), COPILOT_READ_LIMITS.maxDepth);
}

function normalizeSort(sort: unknown): string | undefined {
  if (typeof sort !== 'string') return undefined;
  const t = sort.trim();
  if (!t || t.length > 200) return undefined;
  return t;
}

function fail(
  operation: 'find' | 'findByID',
  collection: string,
  error: CopilotReadErrorCode,
  message: string,
): CopilotReadFailure {
  return { ok: false, operation, collection, error, message };
}

type PayloadRead = Pick<Payload, 'find' | 'findByID'>;

/**
 * Allowlisted `payload.find` for Copilot (capped depth/limit/page).
 * Callers must enforce auth / entitlements before exposing to a model or client.
 */
export async function copilotPayloadFind(
  input: CopilotFindInput,
  payload?: PayloadRead,
): Promise<CopilotReadResult> {
  const collection = typeof input.collection === 'string' ? input.collection.trim() : '';
  if (!collection) {
    return fail('find', '', 'invalid_input', 'Missing collection.');
  }
  if (!isCopilotReadCollectionAllowed(collection)) {
    return fail(
      'find',
      collection,
      'collection_not_allowed',
      `Collection "${collection}" is not allowlisted for Copilot read tools.`,
    );
  }

  const client = payload ?? (await getPayloadClient());
  const limit = normalizeCopilotLimit(input.limit);
  const page = normalizeCopilotPage(input.page);
  const depth = normalizeCopilotDepth(input.depth);
  const sort = normalizeSort(input.sort);

  try {
    const res = await client.find({
      collection,
      where: input.where,
      limit,
      page,
      depth,
      ...(sort ? { sort } : {}),
    });

    return {
      ok: true,
      operation: 'find',
      collection,
      result: {
        docs: res.docs,
        totalDocs: res.totalDocs,
        limit: res.limit ?? limit,
        page: res.page ?? page,
        hasNextPage: Boolean(res.hasNextPage),
        hasPrevPage: Boolean(res.hasPrevPage),
      },
    };
  } catch (e) {
    return fail('find', collection, 'payload_error', unknownErrorMessage(e));
  }
}

/**
 * Allowlisted `payload.findByID` for Copilot (capped depth).
 */
export async function copilotPayloadFindById(
  input: CopilotFindByIdInput,
  payload?: PayloadRead,
): Promise<CopilotReadResult> {
  const collection = typeof input.collection === 'string' ? input.collection.trim() : '';
  const id = typeof input.id === 'string' ? input.id.trim() : '';
  if (!collection || !id) {
    return fail('findByID', collection || '(missing)', 'invalid_input', 'Missing collection or id.');
  }
  if (!isCopilotReadCollectionAllowed(collection)) {
    return fail(
      'findByID',
      collection,
      'collection_not_allowed',
      `Collection "${collection}" is not allowlisted for Copilot read tools.`,
    );
  }

  const client = payload ?? (await getPayloadClient());
  const depth = normalizeCopilotDepth(input.depth);

  try {
    const doc = await client.findByID({
      collection,
      id,
      depth,
    });

    if (doc == null) {
      return fail('findByID', collection, 'not_found', `No document "${id}" in "${collection}".`);
    }

    return {
      ok: true,
      operation: 'findByID',
      collection,
      result: { doc },
    };
  } catch (e) {
    const msg = unknownErrorMessage(e);
    if (/not found/i.test(msg) || /NotFound/i.test(msg)) {
      return fail('findByID', collection, 'not_found', `No document "${id}" in "${collection}".`);
    }
    return fail('findByID', collection, 'payload_error', msg);
  }
}

/** OpenAI tool definitions for a future tool-use loop (global-tooling-05-02). */
export const COPILOT_READ_OPENAI_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'copilot_payload_list',
      description:
        'List documents from an allowlisted site catalog collection (projects, apps, resumes, media metadata, listen rows). Results are paginated and capped.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          collection: {
            type: 'string',
            enum: [...COPILOT_READ_COLLECTION_SLUGS],
            description: 'Payload collection slug',
          },
          limit: { type: 'integer', minimum: 1, maximum: COPILOT_READ_LIMITS.maxLimit },
          page: { type: 'integer', minimum: 1, maximum: COPILOT_READ_LIMITS.maxPage },
          depth: { type: 'integer', minimum: 0, maximum: COPILOT_READ_LIMITS.maxDepth },
          sort: { type: 'string', maxLength: 200 },
          where: {
            type: 'object',
            description: 'Payload where clause (JSON). Omit to list recent rows under limit.',
          },
        },
        required: ['collection'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'copilot_payload_get',
      description: 'Fetch one document by id from an allowlisted collection.',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          collection: {
            type: 'string',
            enum: [...COPILOT_READ_COLLECTION_SLUGS],
          },
          id: { type: 'string', minLength: 1 },
          depth: { type: 'integer', minimum: 0, maximum: COPILOT_READ_LIMITS.maxDepth },
        },
        required: ['collection', 'id'],
      },
    },
  },
];
