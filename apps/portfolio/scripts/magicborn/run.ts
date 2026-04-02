/**
 * Portfolio-side magicborn handler (invoked via `pnpm magicborn` → @magicborn/cli).
 * Command shape: `magicborn <resource> <action> [flags]` (e.g. `book generate`, `book scenes list`).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { getAllContentEntries } from '@/lib/content';
import { createMagicbornCli } from '@/lib/magicborn/magicborn-cli-ui';
import { generateOpenAiImage, getOpenAiImageModel } from '@/lib/magicborn/openai-image-generate';
import { composeMagicbornImagePrompt } from '@/lib/magicborn-prompts/compose-image-prompt';
import { getMagicbornSceneSeed, MAGICBORN_SCENE_SEEDS } from '@/lib/magicborn-prompts/scene-seeds';
import { MAGICBORN_IMAGE_STYLE_BLOCK } from '@/lib/magicborn-prompts/style-block';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';
import { retrieveRagContext } from '@/lib/rag/retrieve';
import { FALLBACK_SITE_APPS } from '@/lib/site-app-registry';
import { runSiteAppsWorker } from '@/lib/site-apps-worker-runner';
import type { MediaImageSize } from '@/lib/site-media';
import {
  type CliModelTask,
  loadMagicbornCliConfig,
  mergeMagicbornCliConfig,
} from './cli-config';
import {
  OPENAI_CURATED_MODELS,
  recommendCheapChatModel,
  recommendModelForTask,
} from './model-catalog';
import { loadMagicbornEnv } from './load-magicborn-env';
import { printCompleteLines } from './complete-words';
import { runOpenAiCli } from './openai-cli';
import {
  PAYLOAD_CLI_GENERATE_ALIASES,
  siteAppRecordFromFallback,
  upsertSiteAppRecordViaLocalPayload,
} from '@/lib/magicborn/payload-cli-generate';
import { getPayloadClient } from '@/lib/payload';

type GenerateTarget = 'book' | 'app' | 'project' | 'planning-pack' | 'listen';

const GENERATE_TARGETS: GenerateTarget[] = ['book', 'app', 'project', 'planning-pack', 'listen'];

const SIZES: MediaImageSize[] = ['1024x1024', '1792x1024', '1024x1792'];

function asGenerateTarget(s: string | undefined): GenerateTarget | undefined {
  if (!s) return undefined;
  return GENERATE_TARGETS.includes(s as GenerateTarget) ? (s as GenerateTarget) : undefined;
}

function resolveRepoRoot(): string {
  return path.resolve(resolvePortfolioAppRoot(), '..', '..');
}

function buildContextExtra(
  target: GenerateTarget,
  values: Record<string, string | undefined>,
): string {
  return [
    target === 'book' && values.slug ? `Book slug: ${values.slug}.` : '',
    (target === 'app' || target === 'project') && values.id ? `${target === 'project' ? 'Project' : 'App'} id: ${values.id}.` : '',
    target === 'planning-pack' && values.pack ? `Planning pack: ${values.pack}.` : '',
    target === 'listen' && values.slug ? `Listen slug: ${values.slug}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Free-form creative text: `--prompt` (preferred) or deprecated `--scene-text`. */
function resolvePromptBody(values: Record<string, string | boolean | undefined>): string | undefined {
  const p = (values.prompt as string | undefined)?.trim();
  if (p) return p;
  return (values['scene-text'] as string | undefined)?.trim();
}

/** Curated seed: `--seed` (preferred) or deprecated `--scene-key`. */
function resolveSeedKey(values: Record<string, string | boolean | undefined>): string | undefined {
  const s = (values.seed as string | undefined)?.trim();
  if (s) return s;
  return (values['scene-key'] as string | undefined)?.trim();
}

function composeFinalPrompt(
  target: GenerateTarget,
  values: Record<string, string | boolean | undefined>,
  raw: boolean,
): string {
  const sceneKey = resolveSeedKey(values);
  const promptBody = resolvePromptBody(values);
  const extra = buildContextExtra(target, {
    slug: values.slug as string | undefined,
    id: values.id as string | undefined,
    pack: values.pack as string | undefined,
  });

  if (!raw) {
    return composeMagicbornImagePrompt({
      sceneKey,
      sceneText: promptBody,
      extraInstructions: extra || undefined,
    });
  }

  const parts: string[] = [];
  if (promptBody) parts.push(promptBody);
  if (sceneKey) {
    const seed = getMagicbornSceneSeed(sceneKey);
    if (seed?.prompt) parts.push(seed.prompt);
  }
  if (extra.trim()) parts.push(extra);
  return parts.join('\n\n').trim();
}

function parseSize(s: string | undefined): MediaImageSize {
  const v = s?.trim();
  if (!v) return '1024x1024';
  if (SIZES.includes(v as MediaImageSize)) return v as MediaImageSize;
  throw new Error(`Invalid --size ${v}. Use: ${SIZES.join(', ')}`);
}

const generateParseOptions = {
  slug: { type: 'string' as const },
  id: { type: 'string' as const },
  pack: { type: 'string' as const },
  prompt: { type: 'string' as const },
  seed: { type: 'string' as const },
  'scene-key': { type: 'string' as const },
  'scene-text': { type: 'string' as const },
  'print-prompt': { type: 'boolean' as const, default: false },
  'dry-run': { type: 'boolean' as const, default: false },
  json: { type: 'boolean' as const, default: false },
  raw: { type: 'boolean' as const, default: false },
  size: { type: 'string' as const },
  slot: { type: 'string' as const },
  'with-rag': { type: 'boolean' as const, default: false },
  book: { type: 'string' as const },
  'rag-query': { type: 'string' as const },
};

function normalizeRagBookSlug(
  values: Record<string, string | boolean | undefined>,
  cfg: ReturnType<typeof loadMagicbornCliConfig>,
): string | undefined {
  const fromFlag = (values.book as string | undefined)?.trim();
  if (fromFlag) return fromFlag;
  const fromSlug = (values.slug as string | undefined)?.trim();
  if (fromSlug) return fromSlug;
  return cfg.rag?.defaultBookSlug?.trim() || undefined;
}

async function collectRagContext(params: {
  bookSlug?: string;
  query: string;
  maxHits: number;
}) {
  const hits = await retrieveRagContext(params.query);
  const filtered = params.bookSlug
    ? hits.filter(
        (h) =>
          h.sourcePath.includes(params.bookSlug as string) ||
          h.publicUrl.includes(params.bookSlug as string),
      )
    : hits;
  return filtered.slice(0, params.maxHits);
}

async function runGenerate(target: GenerateTarget, flagArgs: string[]): Promise<void> {
  const { values } = parseArgs({
    args: flagArgs,
    options: generateParseOptions,
    strict: true,
    allowPositionals: false,
  });

  const isCli = process.env.MAGICBORN_CLI === '1';
  const json = values.json === true;
  const ui = createMagicbornCli(isCli && !json);

  let size: MediaImageSize;
  try {
    size = parseSize(values.size);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }

  const raw = values.raw === true;
  const cliConfig = loadMagicbornCliConfig();
  let finalPrompt: string;
  try {
    finalPrompt = composeFinalPrompt(target, values as Record<string, string | boolean | undefined>, raw);
    if (!raw && cliConfig.styleBlock?.trim()) {
      finalPrompt = composeMagicbornImagePrompt({
        sceneText: resolvePromptBody(values as Record<string, string | boolean | undefined>),
        sceneKey: resolveSeedKey(values as Record<string, string | boolean | undefined>),
        extraInstructions: buildContextExtra(target, {
          slug: values.slug as string | undefined,
          id: values.id as string | undefined,
          pack: values.pack as string | undefined,
        }),
        styleBlock: cliConfig.styleBlock,
      });
    }
  } catch (e) {
    ui.failure(e);
    process.exit(1);
  }

  const model = cliConfig.models?.image?.trim() || getOpenAiImageModel();
  const repoRoot = resolveRepoRoot();
  const magicbornRoot = path.join(repoRoot, '.magicborn');
  const hasKey = Boolean(process.env.OPENAI_API_KEY?.trim());
  const ragDefaultOnForBook = cliConfig.rag?.useRagForBookGenerate !== false;
  const withRag = values['with-rag'] === true || (target === 'book' && ragDefaultOnForBook);
    if (withRag) {
    const ragBookSlug = normalizeRagBookSlug(values as Record<string, string | boolean | undefined>, cliConfig);
    const ragQuery =
      (values['rag-query'] as string | undefined)?.trim() ||
      resolvePromptBody(values as Record<string, string | boolean | undefined>) ||
      `${target} ${ragBookSlug ?? values.id ?? values.pack ?? ''}`.trim();
    if (ragQuery) {
      if (isCli && !json) {
        ui.section('RAG · prompt context');
        ui.info(`query: ${ragQuery.slice(0, 120)}${ragQuery.length > 120 ? '…' : ''}`);
      }
      try {
        const ragHits = await collectRagContext({
          bookSlug: ragBookSlug,
          query: ragQuery,
          maxHits: Math.max(1, Math.min(8, cliConfig.rag?.maxHits ?? 4)),
        });
        if (ragHits.length > 0) {
          if (isCli && !json) {
            ui.step(`Merged ${ragHits.length} RAG hit(s) into prompt`);
          }
          const ragBlock = ragHits
            .map((h, idx) => `${idx + 1}. ${h.title}${h.heading ? ` | ${h.heading}` : ''}\n${h.snippet || h.content}`)
            .join('\n\n');
          finalPrompt = `${finalPrompt}\n\n---\n\nContext from book knowledge base:\n${ragBlock}`;
        } else if (isCli && !json) {
          ui.info('No RAG hits for this query (continuing without extra context).');
        }
      } catch {
        // RAG is additive; generation should continue without it.
      }
    }
  }

  const manifestBase = {
    version: 1 as const,
    target,
    raw,
    useMagicbornStyle: !raw,
    seed: resolveSeedKey(values as Record<string, string | boolean | undefined>),
    promptFragment: resolvePromptBody(values as Record<string, string | boolean | undefined>),
    slug: values.slug,
    id: values.id,
    pack: values.pack,
    mediaSlot: values.slot,
    model,
    size,
    promptChars: finalPrompt.length,
  };

  if (values['dry-run'] === true) {
    if (json) {
      console.log(
        JSON.stringify({ ok: true, mode: 'dry-run', prompt: finalPrompt, ...manifestBase }, null, 2),
      );
    } else {
      ui.banner('generate', target);
      ui.section('Dry-run · prompt preview');
      ui.configSnapshot({
        hasOpenAiKey: hasKey,
        model,
        size,
        repoRoot,
        magicbornRoot,
      });
      ui.step('Composed prompt (preview)');
      console.log('');
      console.log(finalPrompt);
      console.log('');
      ui.dryRunFooter();
    }
    process.exit(0);
  }

  if (values['print-prompt'] === true) {
    if (json) {
      console.log(
        JSON.stringify({ ok: true, mode: 'prompt-only', prompt: finalPrompt, ...manifestBase }, null, 2),
      );
    } else {
      if (isCli) ui.banner('generate', target);
      console.log(finalPrompt);
      if (isCli) ui.promptOnlyFooter();
    }
    process.exit(0);
  }

  if (!hasKey) {
    const msg =
      'OPENAI_API_KEY is not set. Load repo `.env` or export the key. Use --dry-run or --print-prompt to preview without calling OpenAI.';
    if (json) {
      console.log(JSON.stringify({ ok: false, error: 'missing_openai_key', message: msg }, null, 2));
    } else {
      ui.failure(new Error(msg));
    }
    process.exit(1);
  }

  if (!json) {
    ui.banner('generate', target);
    ui.section('OpenAI · image generation');
    ui.configSnapshot({
      hasOpenAiKey: true,
      model,
      size,
      repoRoot,
      magicbornRoot,
    });
  }

  const started = Date.now();
  const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const runDir = path.join(magicbornRoot, 'runs', runId);
  mkdirSync(runDir, { recursive: true });

  if (!json) {
    ui.step(`Calling OpenAI Images (${model}, ${size})…`);
  }

  const result = await ui.withLongRunningResult(`OpenAI Images ${size}`, () =>
    generateOpenAiImage({
      apiKey: process.env.OPENAI_API_KEY!.trim(),
      prompt: finalPrompt,
      size,
      model,
    }),
  );

  const durationMs = Date.now() - started;

  if (!result.ok) {
    if (json) {
      console.log(
        JSON.stringify(
          { ok: false, error: 'openai_error', status: result.status, message: result.message },
          null,
          2,
        ),
      );
    } else {
      ui.failure(new Error(result.message));
    }
    process.exit(1);
  }

  const imagePath = path.join(runDir, 'image.png');
  const promptPath = path.join(runDir, 'prompt.txt');
  const manifestPath = path.join(runDir, 'manifest.json');

  writeFileSync(imagePath, Buffer.from(result.b64Json, 'base64'));
  writeFileSync(promptPath, finalPrompt, 'utf8');

  const manifest = {
    ...manifestBase,
    createdAt: new Date().toISOString(),
    runId,
    durationMs,
    revisedPrompt: result.revisedPrompt,
    usage: result.usage,
    files: {
      image: path.relative(repoRoot, imagePath),
      prompt: path.relative(repoRoot, promptPath),
    },
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  if (!json) {
    ui.success({
      runDir,
      imagePath: path.relative(repoRoot, imagePath),
      promptPath: path.relative(repoRoot, promptPath),
      manifestPath: path.relative(repoRoot, manifestPath),
      durationMs,
      model: result.model,
      usage: result.usage,
    });
  }

  if (json) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: 'generated',
          ...manifest,
          paths: {
            runDir: path.relative(repoRoot, runDir),
            image: path.relative(repoRoot, imagePath),
            prompt: path.relative(repoRoot, promptPath),
            manifest: path.relative(repoRoot, manifestPath),
          },
        },
        null,
        2,
      ),
    );
  }

  process.exit(0);
}

function runStyleCommand(args: string[]): void {
  const action = (args[0] ?? 'show').trim();
  const isCli = process.env.MAGICBORN_CLI === '1';
  const cfg = loadMagicbornCliConfig();
  if (action === 'show') {
    const effective = cfg.styleBlock?.trim() || MAGICBORN_IMAGE_STYLE_BLOCK;
    if (isCli) {
      createMagicbornCli(true).banner('style · show');
      console.log(cfg.styleBlock?.trim() ? 'Source: cli-config override' : 'Source: built-in default');
      console.log('─'.repeat(60));
    }
    console.log(effective);
    process.exit(0);
  }
  if (action === 'set') {
    const next = args.slice(1).join(' ').trim();
    if (!next) {
      console.error('Usage: magicborn style set "<style prompt block>"');
      process.exit(1);
    }
    const out = mergeMagicbornCliConfig({ styleBlock: next });
    console.log(`Saved style override to ${out.path}`);
    process.exit(0);
  }
  if (action === 'clear' || action === 'reset') {
    const out = mergeMagicbornCliConfig({ styleBlock: undefined });
    console.log(`Cleared style override in ${out.path}`);
    process.exit(0);
  }
  if (action === 'suggest') {
    void runStyleSuggest(args.slice(1));
    return;
  }
  console.error(`Unknown style action "${action}". Use: show | set | clear | suggest`);
  process.exit(1);
}

async function runStyleSuggest(args: string[]): Promise<void> {
  const parsed = parseArgs({
    args,
    options: {
      book: { type: 'string' },
      query: { type: 'string' },
      model: { type: 'string' },
      cheap: { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      save: { type: 'boolean', default: false },
    },
    strict: true,
    allowPositionals: false,
  });
  const values = parsed.values;
  const cfg = loadMagicbornCliConfig();
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.error('OPENAI_API_KEY is required for `magicborn style suggest`.');
    process.exit(1);
  }
  const model =
    (values.model as string | undefined)?.trim() ||
    (values.cheap === true
      ? cfg.rag?.cheapSuggestModel || recommendCheapChatModel()
      : cfg.rag?.suggestModel || cfg.models?.chat || process.env.OPENAI_CHAT_MODEL?.trim() || 'gpt-4o-mini');
  const bookSlug =
    (values.book as string | undefined)?.trim() || cfg.rag?.defaultBookSlug?.trim() || undefined;
  const query =
    (values.query as string | undefined)?.trim() ||
    `Create a global Magicborn illustration style block for ${bookSlug ?? 'the book series'}.`;
  let ragHits: Awaited<ReturnType<typeof collectRagContext>> = [];
  try {
    ragHits = await collectRagContext({
      bookSlug,
      query,
      maxHits: Math.max(1, Math.min(8, cfg.rag?.maxHits ?? 4)),
    });
  } catch {
    ragHits = [];
  }
  const ragText = ragHits
    .map((h, i) => `${i + 1}. ${h.title}${h.heading ? ` | ${h.heading}` : ''}\n${h.snippet || h.content}`)
    .join('\n\n');
  const system = [
    'You write concise visual style blocks for image generation prompts.',
    'Output plain text only, 4-8 lines, no markdown fences.',
    'Focus on stable visual language, palette, composition, and constraints (no logos/text/watermarks).',
  ].join('\n');
  const userPrompt = [
    `Goal: ${query}`,
    bookSlug ? `Book slug focus: ${bookSlug}` : '',
    ragText ? `Context:\n${ragText}` : 'No retrieval context found.',
  ]
    .filter(Boolean)
    .join('\n\n');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  const payload = (await response.json().catch(() => null)) as
    | { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } }
    | null;
  if (!response.ok) {
    console.error(payload?.error?.message || `OpenAI request failed (${response.status})`);
    process.exit(1);
  }
  const suggested = payload?.choices?.[0]?.message?.content?.trim();
  if (!suggested) {
    console.error('No style suggestion returned.');
    process.exit(1);
  }
  if (values.save === true) {
    const out = mergeMagicbornCliConfig({ styleBlock: suggested });
    if (values.json === true) {
      console.log(JSON.stringify({ ok: true, model, savedTo: out.path, styleBlock: suggested }, null, 2));
    } else {
      console.log(`Saved style override to ${out.path}\n`);
      console.log(suggested);
    }
    process.exit(0);
  }
  if (values.json === true) {
    console.log(JSON.stringify({ ok: true, model, styleBlock: suggested }, null, 2));
  } else {
    console.log(suggested);
  }
  process.exit(0);
}

function mapOpenAiModelCategory(id: string): 'image' | 'chat' | 'embedding' | 'video' | 'text' {
  const v = id.toLowerCase();
  if (v.includes('embedding')) return 'embedding';
  if (v.includes('image') || v.includes('dall-e')) return 'image';
  if (v.includes('sora') || v.includes('video')) return 'video';
  if (v.startsWith('gpt-') || v.includes('o1') || v.includes('o3') || v.includes('o4')) return 'chat';
  return 'text';
}

async function listLiveOpenAiModels(apiKey: string): Promise<Array<{ id: string; category: string }>> {
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

async function runModelCommand(args: string[]): Promise<void> {
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
    const task = ((args[1] ?? 'chat').trim() as CliModelTask);
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

function runBookScenesList(flagArgs: string[]): void {
  const { values } = parseArgs({
    args: flagArgs,
    options: { json: { type: 'boolean', default: false } },
    strict: true,
    allowPositionals: false,
  });
  const json = values.json === true;
  const rows = MAGICBORN_SCENE_SEEDS.map((s) => ({
    key: s.key,
    title: s.title,
    promptPreview: s.prompt.length > 120 ? `${s.prompt.slice(0, 117)}…` : s.prompt,
  }));
  if (json) {
    console.log(JSON.stringify({ ok: true, scenes: rows }, null, 2));
    process.exit(0);
  }
  const isCli = process.env.MAGICBORN_CLI === '1';
  if (isCli) {
    createMagicbornCli(true).banner('scenes · list', 'book');
    console.log('Curated scene seeds (use --seed <key> with `magicborn book generate`)');
    console.log('─'.repeat(60));
  }
  for (const r of rows) {
    console.log(`${r.key}`);
    console.log(`  ${r.title}`);
    if (isCli) {
      console.log(`  ${r.promptPreview}`);
      console.log('');
    }
  }
  if (isCli) {
    console.log('Tip: magicborn book generate --seed <key> --slug <bookSlug> [--prompt "…"]');
  }
  process.exit(0);
}

function runBookScenesExtract(flagArgs: string[]): void {
  const json = flagArgs.includes('--json');
  const positional = flagArgs.filter((a) => !a.startsWith('-'));
  const slug = positional[0]?.trim();
  const msg =
    'Extracting scenes from manuscript text is not implemented in this command yet. ' +
    'Operator book RAG (separate from site chat) will feed prompt extraction — see global-tooling-dec-01. ' +
    (slug ? `Book slug hint: ${slug}. ` : '') +
    'For now use `magicborn book scenes list` (curated seeds) or author prompts with `magicborn book generate --prompt "…"`.';
  if (json) {
    console.log(JSON.stringify({ ok: false, error: 'not_implemented', message: msg }, null, 2));
  } else {
    console.error(msg);
  }
  process.exit(1);
}

async function runAppList(flagArgs: string[]): Promise<void> {
  const { values } = parseArgs({
    args: flagArgs,
    options: { json: { type: 'boolean', default: false } },
    strict: true,
    allowPositionals: false,
  });
  let source: 'payload' | 'fallback' = 'fallback';
  let rows = FALLBACK_SITE_APPS.map((a) => ({
    id: a.id,
    title: a.title,
    href: a.href,
  }));
  try {
    const result = await runSiteAppsWorker();
    const body = result.body as { ok?: boolean; apps?: Array<{ id?: string; title?: string; href?: string }> };
    if (body?.ok && Array.isArray(body.apps) && body.apps.length > 0) {
      rows = body.apps
        .filter(
          (a): a is { id: string; title: string; href: string } =>
            typeof a?.id === 'string' && typeof a?.title === 'string' && typeof a?.href === 'string',
        )
        .map((a) => ({ id: a.id, title: a.title, href: a.href }));
      source = 'payload';
    }
  } catch {
    source = 'fallback';
  }
  if (values.json === true) {
    console.log(JSON.stringify({ ok: true, source, apps: rows }, null, 2));
    process.exit(0);
  }
  const isCli = process.env.MAGICBORN_CLI === '1';
  if (isCli) {
    createMagicbornCli(true).banner('list', 'app');
    console.log(`Site apps (source: ${source})`);
    console.log('─'.repeat(50));
  }
  for (const r of rows) {
    console.log(`${r.id}\t${r.title}\t${r.href}`);
  }
  if (isCli) {
    console.log('');
    console.log('Tip: magicborn app generate --id <id> --prompt "…"');
  }
  process.exit(0);
}

function runProjectList(flagArgs: string[]): void {
  const { values } = parseArgs({
    args: flagArgs,
    options: { json: { type: 'boolean', default: false } },
    strict: true,
    allowPositionals: false,
  });
  const entries = getAllContentEntries('projects');
  const rows = entries.map((e) => ({
    slug: e.slug,
    title: e.meta.title,
    href: e.href,
  }));
  if (values.json === true) {
    console.log(JSON.stringify({ ok: true, source: 'content', projects: rows }, null, 2));
    process.exit(0);
  }
  const isCli = process.env.MAGICBORN_CLI === '1';
  if (isCli) {
    createMagicbornCli(true).banner('list', 'project');
    console.log('Projects (source: content)');
    console.log('─'.repeat(50));
  }
  for (const r of rows) {
    console.log(`${r.slug}\t${r.title}\t${r.href}`);
  }
  if (isCli) {
    console.log('');
    console.log('Tip: magicborn project generate --id <slug> --prompt "…"');
  }
  process.exit(0);
}

/** Payload discovery smoke: list collection slugs from this app's config (global-tooling-02-05). */
async function runPayloadCollections(argv: string[]): Promise<void> {
  const wantJson = argv.includes('--json');
  const mod = await import('../../payload.config');
  const cfg = await mod.default;
  const cols = (cfg.collections ?? []) as Array<{ slug?: string }>;
  const slugs = cols
    .map((c) => (typeof c?.slug === 'string' ? c.slug.trim() : ''))
    .filter(Boolean)
    .sort();
  if (wantJson) {
    console.log(
      JSON.stringify(
        { ok: true, source: 'apps/portfolio/payload.config.ts', collections: slugs },
        null,
        2,
      ),
    );
  } else {
    for (const s of slugs) {
      console.log(s);
    }
  }
  process.exit(0);
}

/** Payload site-app upsert via in-process Payload (same as seed scripts; PAYLOAD_SECRET + DB). */
async function runPayloadAppGenerate(flagArgs: string[]): Promise<void> {
  const { values } = parseArgs({
    args: flagArgs,
    options: {
      slug: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
    },
    strict: true,
    allowPositionals: false,
  });

  const slug = (values.slug as string | undefined)?.trim();
  const dry = values['dry-run'] === true;
  const wantJson = values.json === true;
  const isCli = process.env.MAGICBORN_CLI === '1';

  const contract = {
    ok: true,
    command: 'payload app generate',
    alias: 'app',
    collection: PAYLOAD_CLI_GENERATE_ALIASES.app.collection,
    label: PAYLOAD_CLI_GENERATE_ALIASES.app.label,
    mechanism:
      'In-process getPayload() — same as scripts/seed-site-app-records.ts. No browser login, no Payload admin API keys.',
    env: {
      PAYLOAD_SECRET: 'Required (Payload config)',
      DATABASE_URL: 'Postgres (or sqlite file path when using sqlite provider)',
      PAYLOAD_DB_PROVIDER: 'postgres | sqlite (matches payload.config)',
    },
    flags: ['--slug <id>', '--dry-run', '--json'],
    bodySource:
      'When --slug matches a built-in registry id, fields are taken from FALLBACK_SITE_APPS; extend with explicit flags later.',
  };

  if (dry) {
    const body = slug ? siteAppRecordFromFallback(slug) : null;
    console.log(
      JSON.stringify(
        {
          ...contract,
          mode: 'dry-run',
          slug: slug ?? null,
          hasPayloadSecret: Boolean(process.env.PAYLOAD_SECRET?.trim()),
          hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
          exampleBody: body,
        },
        null,
        2,
      ),
    );
    process.exit(0);
  }

  if (!slug) {
    const msg = 'payload app generate: pass --slug <id> (registry id) or use --dry-run.';
    if (wantJson) {
      console.log(JSON.stringify({ ok: false, error: 'missing_slug', message: msg }, null, 2));
    } else {
      console.error(msg);
    }
    process.exit(1);
  }

  const body = siteAppRecordFromFallback(slug);
  if (!body) {
    const msg = `Unknown app slug "${slug}". Known registry ids: ${FALLBACK_SITE_APPS.map((a) => a.id).join(', ')}`;
    if (wantJson) {
      console.log(JSON.stringify({ ok: false, error: 'unknown_slug', message: msg }, null, 2));
    } else {
      console.error(msg);
    }
    process.exit(1);
  }

  let result: Awaited<ReturnType<typeof upsertSiteAppRecordViaLocalPayload>>;
  try {
    const payload = await getPayloadClient();
    result = await upsertSiteAppRecordViaLocalPayload(payload, { body, slug });
  } catch (e) {
    const message =
      e instanceof Error
        ? e.message
        : 'Failed to init Payload (check PAYLOAD_SECRET, DATABASE_URL, and provider env).';
    if (wantJson) {
      console.log(JSON.stringify({ ok: false, error: 'payload_init', message }, null, 2));
    } else {
      console.error(message);
    }
    process.exit(1);
  }

  if (wantJson) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    if (isCli) {
      const ui = createMagicbornCli(true);
      ui.banner('generate · payload', 'app');
      ui.step(`${result.mode} ${PAYLOAD_CLI_GENERATE_ALIASES.app.collection} id=${result.id}`);
      ui.info('local Payload (DB + PAYLOAD_SECRET)');
    } else {
      console.log(`${result.mode} site-app-records id=${result.id}`);
    }
  } else if (!wantJson) {
    console.error(result.message);
  }
  process.exit(result.ok ? 0 : 1);
}

async function main() {
  loadMagicbornEnv();

  const argv = process.argv.slice(2);

  if (argv[0] === '__complete') {
    printCompleteLines(argv[1] ?? '');
    process.exit(0);
  }

  if (argv.length === 0) {
    console.error(
      'Usage: magicborn <book|app|project|planning-pack|listen|style|model|openai|chat|payload|pnpm|vendor|completion|shell-init|update> …\nFrom @magicborn/cli, an empty TTY run opens the Ink home; plain mode: magicborn --help',
    );
    process.exit(1);
  }

  const [a0, a1, a2] = argv;

  if (a0 === 'book' && (a1 === 'generate' || a1 === 'gen')) {
    await runGenerate('book', argv.slice(2));
    return;
  }

  if (a0 === 'book' && a1 === 'scenes' && a2 === 'list') {
    runBookScenesList(argv.slice(3));
    return;
  }
  if (a0 === 'book' && a1 === 'scenes' && a2 === 'extract') {
    runBookScenesExtract(argv.slice(3));
    return;
  }

  if (a0 === 'app' && a1 === 'list') {
    await runAppList(argv.slice(2));
    return;
  }
  if (a0 === 'app' && (a1 === 'generate' || a1 === 'gen')) {
    await runGenerate('app', argv.slice(2));
    return;
  }

  if (a0 === 'project' && a1 === 'list') {
    runProjectList(argv.slice(2));
    return;
  }
  if (a0 === 'project' && (a1 === 'generate' || a1 === 'gen')) {
    await runGenerate('project', argv.slice(2));
    return;
  }

  if (a0 === 'planning-pack' && (a1 === 'generate' || a1 === 'gen')) {
    await runGenerate('planning-pack', argv.slice(2));
    return;
  }

  if (a0 === 'listen' && (a1 === 'generate' || a1 === 'gen')) {
    await runGenerate('listen', argv.slice(2));
    return;
  }

  if (a0 === 'style') {
    runStyleCommand(argv.slice(1));
    return;
  }

  if (a0 === 'model') {
    await runModelCommand(argv.slice(1));
    return;
  }

  if (a0 === 'openai') {
    await runOpenAiCli(argv.slice(1));
    return;
  }

  if (a0 === 'payload' && a1 === 'collections') {
    await runPayloadCollections(argv.slice(2));
    return;
  }

  if (a0 === 'payload' && a1 === 'app' && (a2 === 'generate' || a2 === 'gen')) {
    await runPayloadAppGenerate(argv.slice(3));
    return;
  }

  /* Legacy: generate <target> … */
  if (a0 === 'generate') {
    const legacyTarget = asGenerateTarget(a1);
    if (!legacyTarget) {
      console.error(
        `Unknown target "${a1 ?? ''}". Use: magicborn <book|app|project|…> generate … (resource first).`,
      );
      process.exit(1);
    }
    await runGenerate(legacyTarget, argv.slice(2));
    return;
  }

  console.error(
    `Unknown command: ${argv.slice(0, 3).join(' ')}. See magicborn --help`,
  );
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
