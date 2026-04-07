import { isCopilotToolsAuthorized } from '@/lib/copilot/copilot-tools-auth';
import { isCopilotMutateCollectionAllowed } from '@/lib/copilot/copilot-mutate-allowlist';
import { buildCopilotFormDescriptor } from '@/lib/copilot/form-descriptor';
import { sanitizeCopilotCreateData } from '@/lib/copilot/sanitize-copilot-create-data';
import { getPayloadClient } from '@/lib/payload';
import { unknownErrorMessage } from '@/lib/unknown-error';

export const runtime = 'nodejs';

type Body = {
  collection?: string;
  data?: Record<string, unknown>;
  confirm?: boolean;
};

export async function POST(request: Request) {
  if (!isCopilotToolsAuthorized(request)) {
    return Response.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.confirm) {
    return Response.json(
      { error: 'confirm_required', message: 'Set confirm: true to create a record.' },
      { status: 400 },
    );
  }

  const collection = typeof body.collection === 'string' ? body.collection.trim() : '';
  if (!collection || !isCopilotMutateCollectionAllowed(collection)) {
    return Response.json({ error: 'collection_not_allowed' }, { status: 400 });
  }

  const data = body.data && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : {};
  const desc = buildCopilotFormDescriptor({ collection, intent: 'create' });
  if (!desc) {
    return Response.json({ error: 'no_descriptor' }, { status: 400 });
  }

  const safe = sanitizeCopilotCreateData(desc, data);
  if (Object.keys(safe).length === 0) {
    return Response.json({ error: 'empty_data' }, { status: 400 });
  }

  const payload = await getPayloadClient();
  try {
    const doc = await payload.create({
      collection,
      data: safe,
      overrideAccess: true,
    });
    return Response.json({ ok: true, id: doc.id });
  } catch (e) {
    return Response.json({ error: 'create_failed', message: unknownErrorMessage(e) }, { status: 502 });
  }
}
