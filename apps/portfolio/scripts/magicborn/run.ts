/**
 * Portfolio-side magicborn handler (invoked via `pnpm magicborn` → @magicborn/cli).
 * Command shape: `magicborn <resource> <action> [flags]` (e.g. `book generate`, `book scenes list`).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import matter from 'gray-matter';
import { getAllContentEntries } from '@/lib/content';
import { extractSceneCandidatesFromMdx } from '@/lib/magicborn/extract-mdx-scenes';
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
import { parseBatchScenes } from './batch-scene-parse';
import { printCompleteLines } from './complete-words';
import { runOpenAiCli } from './openai-cli';
import {
  PAYLOAD_CLI_GENERATE_ALIASES,
  siteAppRecordFromFallback,
  upsertSiteAppRecordViaLocalPayload,
} from '@/lib/magicborn/payload-cli-generate';
import { getPayloadClient } from '@/lib/payload';
import { scanEpubIllustrationGaps } from '@/lib/books/scan-epub-illustration-gaps';
import { listSiteLogoCandidates, setActiveSiteLogo } from '@/lib/magicborn/site-logo-cli';

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

const batchParseOptions = {
  style: { type: 'string' as const },
  target: { type: 'string' as const, default: 'project' },
  medium: { type: 'string' as const, default: 'image' },
  scenes: { type: 'string' as const },
  'scenes-file': { type: 'string' as const },
  'continue-on-error': { type: 'boolean' as const, default: false },
  slug: { type: 'string' as const },
  id: { type: 'string' as const },
  pack: { type: 'string' as const },
  'print-prompt': { type: 'boolean' as const, default: false },
  'dry-run': { type: 'boolean' as const, default: false },
  json: { type: 'boolean' as const, default: false },
  raw: { type: 'boolean' as const, default: false },
  size: { type: 'string' as const },
  slot: { type: 'string' as const },
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

function finalizeImagePrompt(
  target: GenerateTarget,
  values: Record<string, string | boolean | undefined>,
  raw: boolean,
  cliConfig: ReturnType<typeof loadMagicbornCliConfig>,
): string {
  let finalPrompt = composeFinalPrompt(target, values, raw);
  if (!raw && cliConfig.styleBlock?.trim()) {
    finalPrompt = composeMagicbornImagePrompt({
      sceneText: resolvePromptBody(values),
      sceneKey: resolveSeedKey(values),
      extraInstructions: buildContextExtra(target, {
        slug: values.slug as string | undefined,
        id: values.id as string | undefined,
        pack: values.pack as string | undefined,
      }),
      styleBlock: cliConfig.styleBlock,
    });
  }
  return finalPrompt;
}

type GenerateManifestBase = {
  version: 1;
  target: GenerateTarget;
  raw: boolean;
  useMagicbornStyle: boolean;
  seed?: string;
  promptFragment?: string;
  slug?: string;
  id?: string;
  pack?: string;
  mediaSlot?: string;
  model: string;
  size: MediaImageSize;
};

async function executeOpenAiImageRun(params: {
  finalPrompt: string;
  manifestBase: GenerateManifestBase;
  manifestExtras?: Record<string, unknown>;
  ui: ReturnType<typeof createMagicbornCli>;
  json: boolean;
}): Promise<
  | {
      ok: true;
      runId: string;
      manifest: Record<string, unknown>;
      durationMs: number;
      model: string;
      usage?: { totalTokens?: number; inputTokens?: number; outputTokens?: number };
      paths: {
        runDir: string;
        image: string;
        prompt: string;
        manifest: string;
      };
    }
  | { ok: false; message: string; status?: number }
> {
  const repoRoot = resolveRepoRoot();
  const magicbornRoot = path.join(repoRoot, '.magicborn');
  const { finalPrompt, manifestBase, manifestExtras, ui, json } = params;
  const model = manifestBase.model;
  const size = manifestBase.size;

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
    return { ok: false, message: result.message, status: result.status };
  }

  const imagePath = path.join(runDir, 'image.png');
  const promptPath = path.join(runDir, 'prompt.txt');
  const manifestPath = path.join(runDir, 'manifest.json');

  writeFileSync(imagePath, Buffer.from(result.b64Json, 'base64'));
  writeFileSync(promptPath, finalPrompt, 'utf8');

  const manifest: Record<string, unknown> = {
    ...manifestBase,
    promptChars: finalPrompt.length,
    createdAt: new Date().toISOString(),
    runId,
    durationMs,
    revisedPrompt: result.revisedPrompt,
    usage: result.usage,
    files: {
      image: path.relative(repoRoot, imagePath),
      prompt: path.relative(repoRoot, promptPath),
    },
    ...(manifestExtras ?? {}),
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  return {
    ok: true,
    runId,
    manifest,
    durationMs,
    model: result.model,
    usage: result.usage,
    paths: {
      runDir: path.relative(repoRoot, runDir),
      image: path.relative(repoRoot, imagePath),
      prompt: path.relative(repoRoot, promptPath),
      manifest: path.relative(repoRoot, manifestPath),
    },
  };
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
    finalPrompt = finalizeImagePrompt(target, values as Record<string, string | boolean | undefined>, raw, cliConfig);
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

  const manifestBase: GenerateManifestBase = {
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
  };

  if (values['dry-run'] === true) {
    if (json) {
      console.log(
        JSON.stringify(
          { ok: true, mode: 'dry-run', prompt: finalPrompt, ...manifestBase, promptChars: finalPrompt.length },
          null,
          2,
        ),
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
        JSON.stringify(
          { ok: true, mode: 'prompt-only', prompt: finalPrompt, ...manifestBase, promptChars: finalPrompt.length },
          null,
          2,
        ),
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

  const execResult = await executeOpenAiImageRun({
    finalPrompt,
    manifestBase,
    ui,
    json,
  });

  if (!execResult.ok) {
    if (json) {
      console.log(
        JSON.stringify(
          { ok: false, error: 'openai_error', status: execResult.status, message: execResult.message },
          null,
          2,
        ),
      );
    } else {
      ui.failure(new Error(execResult.message));
    }
    process.exit(1);
  }

  const { manifest, paths, durationMs, model: outModel, usage } = execResult;
  const runDirAbs = path.join(repoRoot, paths.runDir);

  if (!json) {
    ui.success({
      runDir: runDirAbs,
      imagePath: paths.image,
      promptPath: paths.prompt,
      manifestPath: paths.manifest,
      durationMs,
      model: outModel,
      usage,
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
            runDir: paths.runDir,
            image: paths.image,
            prompt: paths.prompt,
            manifest: paths.manifest,
          },
        },
        null,
        2,
      ),
    );
  }

  process.exit(0);
}

async function runBatch(flagArgs: string[]): Promise<void> {
  const { values } = parseArgs({
    args: flagArgs,
    options: batchParseOptions,
    strict: true,
    allowPositionals: false,
  });

  const isCli = process.env.MAGICBORN_CLI === '1';
  const json = values.json === true;
  const ui = createMagicbornCli(isCli && !json);

  const style = (values.style as string | undefined)?.trim();
  if (!style) {
    const msg = 'Missing --style <text> (art direction for every scene).';
    if (json) {
      console.log(JSON.stringify({ ok: false, error: 'missing_style', message: msg }, null, 2));
    } else {
      console.error(msg);
    }
    process.exit(1);
  }

  const raw = values.raw === true;
  const cliConfig = loadMagicbornCliConfig();
  let size: MediaImageSize;
  try {
    size = parseSize(values.size);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }

  const medium = (values.medium as string | undefined)?.trim().toLowerCase() || 'image';
  if (medium !== 'image') {
    const msg = `Unknown --medium "${medium}". Only "image" is supported in this batch (v1).`;
    if (json) {
      console.log(JSON.stringify({ ok: false, error: 'unsupported_medium', message: msg }, null, 2));
    } else {
      console.error(msg);
    }
    process.exit(1);
  }

  const target = asGenerateTarget((values.target as string | undefined)?.trim());
  if (!target) {
    const msg = `Unknown --target "${values.target}". Use: book | app | project | planning-pack | listen`;
    if (json) {
      console.log(JSON.stringify({ ok: false, error: 'bad_target', message: msg }, null, 2));
    } else {
      console.error(msg);
    }
    process.exit(1);
  }

  const repoRoot = resolveRepoRoot();
  const scenes = parseBatchScenes(
    values.scenes as string | undefined,
    values['scenes-file'] as string | undefined,
    repoRoot,
  );
  if (scenes.length === 0) {
    const msg = 'No scenes: pass --scenes "a,b,c" or --scenes-file path.txt (one line per scene).';
    if (json) {
      console.log(JSON.stringify({ ok: false, error: 'no_scenes', message: msg }, null, 2));
    } else {
      console.error(msg);
    }
    process.exit(1);
  }

  const baseValues: Record<string, string | boolean | undefined> = {
    slug: values.slug,
    id: values.id,
    pack: values.pack,
    size: values.size,
    raw: values.raw,
    slot: values.slot,
  };

  const model = cliConfig.models?.image?.trim() || getOpenAiImageModel();
  const magicbornRoot = path.join(repoRoot, '.magicborn');
  const hasKey = Boolean(process.env.OPENAI_API_KEY?.trim());

  const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const batchDir = path.join(magicbornRoot, 'batches', batchId);

  if (values['dry-run'] === true) {
    const previews: { scene: string; prompt: string }[] = [];
    for (const scene of scenes) {
      const mergedValues = { ...baseValues, prompt: `${style}\n\nScene: ${scene}` };
      const finalPrompt = finalizeImagePrompt(target, mergedValues, raw, cliConfig);
      previews.push({ scene, prompt: finalPrompt });
    }
    if (json) {
      console.log(
        JSON.stringify(
          { ok: true, mode: 'dry-run', batchId, target, style, medium, scenes: previews },
          null,
          2,
        ),
      );
    } else {
      ui.banner('batch · multi-scene', target);
      ui.section('Dry-run · prompt previews');
      for (const p of previews) {
        console.log(`\n── Scene: ${p.scene}`);
        console.log(p.prompt);
      }
      ui.dryRunFooter();
    }
    process.exit(0);
  }

  if (values['print-prompt'] === true) {
    for (const scene of scenes) {
      const mergedValues = { ...baseValues, prompt: `${style}\n\nScene: ${scene}` };
      const finalPrompt = finalizeImagePrompt(target, mergedValues, raw, cliConfig);
      console.log(finalPrompt);
      console.log('\n---\n');
    }
    process.exit(0);
  }

  if (!hasKey) {
    const msg = 'OPENAI_API_KEY is not set. Use --dry-run to preview prompts.';
    if (json) {
      console.log(JSON.stringify({ ok: false, error: 'missing_openai_key', message: msg }, null, 2));
    } else {
      ui.failure(new Error(msg));
    }
    process.exit(1);
  }

  mkdirSync(batchDir, { recursive: true });

  if (!json) {
    ui.banner('batch · multi-scene', target);
    ui.section('OpenAI · batch image generation');
    ui.configSnapshot({
      hasOpenAiKey: true,
      model,
      size,
      repoRoot,
      magicbornRoot,
    });
    ui.info(`Batch ${batchId} · ${scenes.length} scene(s) · medium=${medium}`);
  }

  const runsOut: Array<{
    sceneLabel: string;
    sceneIndex: number;
    runId: string;
    manifestPath: string;
    ok: boolean;
    error?: string;
  }> = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const mergedValues = { ...baseValues, prompt: `${style}\n\nScene: ${scene}` };
    let finalPrompt: string;
    try {
      finalPrompt = finalizeImagePrompt(target, mergedValues, raw, cliConfig);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!values['continue-on-error']) {
        if (json) {
          console.log(JSON.stringify({ ok: false, error: 'compose_failed', message: msg }, null, 2));
        } else {
          ui.failure(e instanceof Error ? e : new Error(msg));
        }
        process.exit(1);
      }
      runsOut.push({ sceneLabel: scene, sceneIndex: i, runId: '', manifestPath: '', ok: false, error: msg });
      continue;
    }

    const manifestBase: GenerateManifestBase = {
      version: 1,
      target,
      raw,
      useMagicbornStyle: !raw,
      seed: undefined,
      promptFragment: resolvePromptBody(mergedValues),
      slug: values.slug,
      id: values.id,
      pack: values.pack,
      mediaSlot: values.slot,
      model,
      size,
    };

    const manifestExtras = {
      batch: {
        phase: 'global-tooling-05-04',
        batchId,
        sceneIndex: i,
        sceneLabel: scene,
        styleLine: style,
        medium: 'image',
      },
    };

    if (!json) {
      ui.step(`Scene ${i + 1}/${scenes.length}: ${scene}`);
    }

    const execResult = await executeOpenAiImageRun({
      finalPrompt,
      manifestBase,
      manifestExtras,
      ui,
      json,
    });

    if (!execResult.ok) {
      runsOut.push({
        sceneLabel: scene,
        sceneIndex: i,
        runId: '',
        manifestPath: '',
        ok: false,
        error: execResult.message,
      });
      if (!values['continue-on-error']) {
        if (json) {
          console.log(
            JSON.stringify(
              {
                ok: false,
                error: 'openai_error',
                status: execResult.status,
                message: execResult.message,
                batchId,
                partial: runsOut,
              },
              null,
              2,
            ),
          );
        } else {
          ui.failure(new Error(execResult.message));
        }
        process.exit(1);
      }
      continue;
    }

    runsOut.push({
      sceneLabel: scene,
      sceneIndex: i,
      runId: execResult.runId,
      manifestPath: execResult.paths.manifest,
      ok: true,
    });

    if (!json) {
      ui.success({
        runDir: path.join(repoRoot, execResult.paths.runDir),
        imagePath: execResult.paths.image,
        promptPath: execResult.paths.prompt,
        manifestPath: execResult.paths.manifest,
        durationMs: execResult.durationMs,
        model: execResult.model,
        usage: execResult.usage,
      });
    }
  }

  const batchManifest = {
    version: 1,
    kind: 'batch' as const,
    taxonomy: {
      phase: 'global-tooling-05-04',
      targetKind: target,
      medium: 'image' as const,
    },
    batchId,
    createdAt: new Date().toISOString(),
    style,
    target,
    sceneCount: scenes.length,
    runs: runsOut.filter((r) => r.ok).map((r) => ({
      sceneLabel: r.sceneLabel,
      sceneIndex: r.sceneIndex,
      runId: r.runId,
      manifest: r.manifestPath,
    })),
    failures: runsOut.filter((r) => !r.ok).map((r) => ({
      sceneLabel: r.sceneLabel,
      sceneIndex: r.sceneIndex,
      error: r.error,
    })),
  };

  const batchManifestPath = path.join(batchDir, 'batch.json');
  writeFileSync(batchManifestPath, JSON.stringify(batchManifest, null, 2), 'utf8');

  if (json) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: 'batch',
          ...batchManifest,
          batchManifestPath: path.relative(repoRoot, batchManifestPath),
        },
        null,
        2,
      ),
    );
  } else {
    ui.info(`Batch manifest: ${path.relative(repoRoot, batchManifestPath)}`);
  }

  const anyFail = runsOut.some((r) => !r.ok);
  process.exit(anyFail ? 1 : 0);
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

const extractParseOptions = {
  json: { type: 'boolean' as const, default: false },
  file: { type: 'string' as const },
  slug: { type: 'string' as const },
  'all-headings': { type: 'boolean' as const, default: false },
};

function loadMdxInputsForExtract(
  repoRoot: string,
  opts: { file?: string; slug?: string },
): { label: string; raw: string }[] {
  const appRoot = resolvePortfolioAppRoot();
  if (opts.file?.trim()) {
    const rel = opts.file.trim();
    const p = path.isAbsolute(rel) ? rel : path.join(repoRoot, rel);
    if (!existsSync(p)) {
      throw new Error(`File not found: ${p}`);
    }
    return [{ label: path.relative(repoRoot, p), raw: readFileSync(p, 'utf8') }];
  }
  if (opts.slug?.trim()) {
    const slug = opts.slug.trim();
    const dir = path.join(appRoot, 'content', 'docs', 'magicborn', 'in-world', slug);
    if (!existsSync(dir)) {
      throw new Error(
        `No folder ${dir}. Use a book slug under content/docs/magicborn/in-world/<slug>/ or --file <path>.`,
      );
    }
    const files = readdirSync(dir).filter((f) => f.endsWith('.mdx')).sort();
    if (files.length === 0) {
      throw new Error(`No .mdx files in ${dir}`);
    }
    return files.map((f) => {
      const fp = path.join(dir, f);
      return { label: path.relative(repoRoot, fp), raw: readFileSync(fp, 'utf8') };
    });
  }
  throw new Error('Pass --file <path> or --slug <book> (or a positional slug after extract).');
}

function runBookScenesExtract(flagArgs: string[]): void {
  const { values, positionals } = parseArgs({
    args: flagArgs,
    options: extractParseOptions,
    strict: true,
    allowPositionals: true,
  });

  const json = values.json === true;
  const allHeadings = values['all-headings'] === true;
  const slugArg = (values.slug as string | undefined)?.trim() || positionals[0]?.trim();
  const fileArg = (values.file as string | undefined)?.trim();

  const isCli = process.env.MAGICBORN_CLI === '1';

  try {
    const repoRoot = resolveRepoRoot();
    const inputs = loadMdxInputsForExtract(repoRoot, { file: fileArg, slug: slugArg });

    type BlockOut = {
      index: number;
      heading: string;
      lineStart: number;
      bodyChars: number;
      bodyPreview: string;
    };

    const fileResults: { path: string; frontmatterTitle?: string; blocks: BlockOut[] }[] = [];
    let blockTotal = 0;

    for (const input of inputs) {
      const parsed = matter(input.raw);
      const content = parsed.content;
      const title = typeof parsed.data?.title === 'string' ? parsed.data.title : undefined;
      const blocks = extractSceneCandidatesFromMdx(content, { includeAllHeadings: allHeadings });
      const outBlocks: BlockOut[] = blocks.map((b) => ({
        index: b.index,
        heading: b.heading,
        lineStart: b.lineStart,
        bodyChars: b.body.length,
        bodyPreview: b.body.length > 360 ? `${b.body.slice(0, 357)}…` : b.body,
      }));
      blockTotal += outBlocks.length;
      fileResults.push({
        path: input.label.replace(/\\/g, '/'),
        ...(title ? { frontmatterTitle: title } : {}),
        blocks: outBlocks,
      });
    }

    if (json) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            phase: 'global-tooling-05-05',
            allHeadings,
            summary: { fileCount: fileResults.length, blockCount: blockTotal },
            files: fileResults,
          },
          null,
          2,
        ),
      );
      process.exit(0);
    }

    if (isCli) {
      createMagicbornCli(true).banner('scenes · extract', 'book');
    }
    console.log(`Extracted ${blockTotal} scene-like block(s) from ${fileResults.length} file(s).`);
    console.log('─'.repeat(60));
    for (const fr of fileResults) {
      console.log(`File: ${fr.path}`);
      if (fr.frontmatterTitle) {
        console.log(`  title: ${fr.frontmatterTitle}`);
      }
      for (const b of fr.blocks) {
        console.log(`  [${b.index}] L${b.lineStart} · ${b.heading}`);
        console.log(`      ${b.bodyPreview.split('\n').join('\n      ')}`);
        console.log('');
      }
    }
    if (isCli) {
      console.log('Tip: pipe JSON with --json for scripts; use `magicborn batch --style "…" --scenes "a,b"` with labels.');
    }
    process.exit(0);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (json) {
      console.log(JSON.stringify({ ok: false, error: 'extract_failed', message: msg }, null, 2));
    } else {
      console.error(msg);
    }
    process.exit(1);
  }
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

async function runBooksIllustrationsScan(rest: string[]) {
  const { values, positionals } = parseArgs({
    args: rest,
    options: {
      epub: { type: 'string' },
      json: { type: 'boolean', default: false },
    },
    allowPositionals: true,
  });
  const epubPath = (values.epub as string | undefined)?.trim();
  const slug = positionals[0]?.trim();
  const wantJson = values.json === true;
  if (!epubPath) {
    const msg =
      'Usage: magicborn books illustrations scan [label] --epub <path-to.epub> [--json]';
    if (wantJson) {
      console.log(JSON.stringify({ ok: false, error: 'missing_epub', message: msg }, null, 2));
    } else {
      console.error(msg);
    }
    process.exit(1);
  }
  const data = readFileSync(epubPath);
  const epubLabel = slug || path.basename(epubPath, path.extname(epubPath));
  const result = await scanEpubIllustrationGaps({ epubLabel, data });
  if (wantJson) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(`Label: ${result.epubLabel}`);
    console.log(`Pending illustration slots: ${result.pendingCount}`);
    for (const s of result.slots) {
      const hint = s.anchorHint ? ` #${s.anchorHint}` : '';
      console.log(
        `- [${s.orderIndex}] ${s.spinePath} (spine ${s.spineIndex})${hint}\n  context: ${s.contextText.slice(0, 200)}${s.contextText.length > 200 ? '…' : ''}`,
      );
    }
  } else {
    console.error(result.error);
  }
  process.exit(result.ok ? 0 : 1);
}

async function runSiteLogoList(rest: string[]) {
  const { values } = parseArgs({
    args: rest,
    options: { json: { type: 'boolean', default: false } },
  });
  const wantJson = values.json === true;
  try {
    const payload = await getPayloadClient();
    const rows = await listSiteLogoCandidates(payload);
    if (wantJson) {
      console.log(JSON.stringify({ ok: true, candidates: rows }, null, 2));
    } else {
      for (const r of rows) {
        const mark = r.isCurrent ? '*' : ' ';
        console.log(`${mark} ${r.id}\t${r.title}\t${r.sourcePath}`);
      }
    }
    process.exit(0);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (wantJson) {
      console.log(JSON.stringify({ ok: false, error: message }, null, 2));
    } else {
      console.error(message);
    }
    process.exit(1);
  }
}

async function runSiteLogoSetActive(rest: string[]) {
  const { values, positionals } = parseArgs({
    args: rest,
    options: { json: { type: 'boolean', default: false } },
    allowPositionals: true,
  });
  const wantJson = values.json === true;
  const rawId = positionals[0]?.trim();
  if (!rawId) {
    const msg = 'Usage: magicborn site logo set-active <id> [--json]';
    if (wantJson) {
      console.log(JSON.stringify({ ok: false, error: 'missing_id', message: msg }, null, 2));
    } else {
      console.error(msg);
    }
    process.exit(1);
  }
  try {
    const payload = await getPayloadClient();
    const result = await setActiveSiteLogo(payload, rawId);
    if (result.ok) {
      if (wantJson) {
        console.log(JSON.stringify({ ok: true, id: rawId }, null, 2));
      } else {
        console.log(`Active site logo set to id=${rawId}`);
      }
      process.exit(0);
    }
    if (wantJson) {
      console.log(JSON.stringify({ ok: false, message: result.message }, null, 2));
    } else {
      console.error(result.message);
    }
    process.exit(1);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (wantJson) {
      console.log(JSON.stringify({ ok: false, error: message }, null, 2));
    } else {
      console.error(message);
    }
    process.exit(1);
  }
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
      'Usage: magicborn <book|books|app|project|planning-pack|listen|batch|site|style|model|openai|chat|payload|pnpm|vendor|completion|shell-init|update> …\nFrom @magicborn/cli, an empty TTY run opens the Ink home; plain mode: magicborn --help',
    );
    process.exit(1);
  }

  const [a0, a1, a2] = argv;

  if (a0 === 'books' && a1 === 'illustrations' && a2 === 'scan') {
    await runBooksIllustrationsScan(argv.slice(3));
    return;
  }

  if (a0 === 'site' && a1 === 'logo' && a2 === 'list') {
    await runSiteLogoList(argv.slice(3));
    return;
  }

  if (a0 === 'site' && a1 === 'logo' && a2 === 'set-active') {
    await runSiteLogoSetActive(argv.slice(3));
    return;
  }

  if (a0 === 'batch') {
    await runBatch(argv.slice(1));
    return;
  }

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
