import { parseArgs } from 'node:util';
import { getOpenAiImageModel } from '@/lib/magicborn/openai-image-generate';
import { type CliModelTask, loadMagicbornCliConfig, mergeMagicbornCliConfig } from '../cli-config';
import { OPENAI_CURATED_MODELS, recommendModelForTask } from '../model-catalog';

function mapOpenAiModelCategory(id: string): 'image' | 'chat' | 'embedding' | 'video' | 'text' {
  const v = id.toLowerCase();
  if (v.includes('embedding')) return 'embedding';
  if (v.includes('image') || v.includes('dall-e')) return 'image';
  if (v.includes('sora') || v.includes('video')) return 'video';
  if (v.startsWith('gpt-') || v.includes('o1') || v.includes('o3') || v.includes('o4')) return 'chat';
  return 'text';
}

async function listLiveOpenAiModels(
  apiKey: string,
): Promise<Array<{ id: string; category: string }>> {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    throw new Error(`OpenAI models API failed (${res.status})`);
  }
  const body = (await res.json()) as { data?: Array<{ id?: string }> };
  const ids = (body.data ?? []).map((m) => m.id).filter((id): id is string => typeof id === 'string');
  return ids
    .map((id) => ({ id, category: mapOpenAiModelCategory(id) }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export async function runModelCommand(args: string[]): Promise<void> {
  const action = (args[0] ?? 'get').trim();
  const cfg = loadMagicbornCliConfig();
  if (action === 'get') {
    const effective = {
      image: cfg.models?.image ?? getOpenAiImageModel(),
      chat: cfg.models?.chat ?? process.env.OPENAI_CHAT_MODEL?.trim() ?? 'gpt-4o-mini',
      embedding: cfg.models?.embedding ?? process.env.OPENAI_EMBEDDING_MODEL?.trim() ?? 'text-embedding-3-small',
      video: cfg.models?.video ?? 'sora',
    };
    console.log(
      JSON.stringify(
        {
          ok: true,
          effective,
          config: {
            models: cfg.models ?? {},
            rag: cfg.rag ?? {},
          },
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  if (action === 'set') {
    const task = (args[1] ?? '').trim() as CliModelTask;
    const modelId = (args[2] ?? '').trim();
    if (!['image', 'chat', 'embedding', 'video'].includes(task) || !modelId) {
      console.error('Usage: magicborn model set <image|chat|embedding|video> <model-id>');
      process.exit(1);
    }
    const out = mergeMagicbornCliConfig({ models: { [task]: modelId } });
    console.log(`Saved ${task} model "${modelId}" to ${out.path}`);
    process.exit(0);
  }
  if (action === 'recommend') {
    const task = (args[1] ?? 'chat').trim() as CliModelTask;
    if (!['image', 'chat', 'embedding', 'video'].includes(task)) {
      console.error('Usage: magicborn model recommend <image|chat|embedding|video>');
      process.exit(1);
    }
    console.log(recommendModelForTask(task));
    process.exit(0);
  }
  if (action === 'list') {
    const live = args.includes('--live');
    if (live) {
      const apiKey = process.env.OPENAI_API_KEY?.trim();
      if (!apiKey) {
        console.error('OPENAI_API_KEY is required for `magicborn model list --live`.');
        process.exit(1);
      }
      const models = await listLiveOpenAiModels(apiKey);
      console.log(JSON.stringify({ ok: true, provider: 'openai', source: 'live', models }, null, 2));
      process.exit(0);
    }
    console.log(
      JSON.stringify(
        { ok: true, provider: 'openai', source: 'curated', models: OPENAI_CURATED_MODELS },
        null,
        2,
      ),
    );
    process.exit(0);
  }
  if (action === 'config') {
    const parsed = parseArgs({
      args: args.slice(1),
      options: {
        'rag-enabled': { type: 'string' },
        'rag-book': { type: 'string' },
        'rag-max-hits': { type: 'string' },
        'rag-auto-book': { type: 'string' },
        'suggest-model': { type: 'string' },
        'cheap-suggest-model': { type: 'string' },
      },
      strict: true,
      allowPositionals: false,
    });
    const v = parsed.values;
    const patch = {
      rag: {
        enabled: v['rag-enabled'] ? v['rag-enabled'] === '1' || v['rag-enabled'] === 'true' : undefined,
        defaultBookSlug: (v['rag-book'] as string | undefined)?.trim() || undefined,
        maxHits: v['rag-max-hits'] ? Number(v['rag-max-hits']) : undefined,
        useRagForBookGenerate: v['rag-auto-book']
          ? v['rag-auto-book'] === '1' || v['rag-auto-book'] === 'true'
          : undefined,
        suggestModel: (v['suggest-model'] as string | undefined)?.trim() || undefined,
        cheapSuggestModel: (v['cheap-suggest-model'] as string | undefined)?.trim() || undefined,
      },
    };
    const out = mergeMagicbornCliConfig(patch);
    console.log(JSON.stringify({ ok: true, savedTo: out.path, rag: out.config.rag ?? {} }, null, 2));
    process.exit(0);
  }
  console.error('Usage: magicborn model <get|set|recommend|list|config>');
  process.exit(1);
}
