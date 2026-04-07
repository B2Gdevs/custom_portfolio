import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { createMagicbornCli } from '@/lib/magicborn/magicborn-cli-ui';
import { getOpenAiImageModel } from '@/lib/magicborn/openai-image-generate';
import { loadMagicbornCliConfig } from '../cli-config';
import { parseBatchScenes } from '../batch-scene-parse';
import {
  type GenerateManifestBase,
  asGenerateTarget,
  batchParseOptions,
  parseImageSize,
} from '../generate-config';
import { executeOpenAiImageRun } from '../image-execute';
import { finalizeImagePrompt, resolvePromptBody } from '../prompt-compose';
import { resolveMagicbornRepoRoot } from '../paths';
import { exitJsonError, exitJsonErrorOr } from '../cli-json';

/** Multi-scene image batch (`magicborn batch …`). */
export async function runBatch(flagArgs: string[]): Promise<void> {
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
    exitJsonError(json, msg, { error: 'missing_style' });
  }

  const raw = values.raw === true;
  const cliConfig = loadMagicbornCliConfig();
  let size;
  try {
    size = parseImageSize(values.size);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    exitJsonError(json, msg, { error: 'bad_image_size' });
  }

  const medium = (values.medium as string | undefined)?.trim().toLowerCase() || 'image';
  if (medium !== 'image') {
    const msg = `Unknown --medium "${medium}". Only "image" is supported in this batch (v1).`;
    exitJsonError(json, msg, { error: 'unsupported_medium' });
  }

  const target = asGenerateTarget((values.target as string | undefined)?.trim());
  if (!target) {
    const msg = `Unknown --target "${values.target}". Use: book | app | project | planning-pack | listen`;
    exitJsonError(json, msg, { error: 'bad_target' });
  }

  const repoRoot = resolveMagicbornRepoRoot();
  const scenes = parseBatchScenes(
    values.scenes as string | undefined,
    values['scenes-file'] as string | undefined,
    repoRoot,
  );
  if (scenes.length === 0) {
    const msg = 'No scenes: pass --scenes "a,b,c" or --scenes-file path.txt (one line per scene).';
    exitJsonError(json, msg, { error: 'no_scenes' });
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
    exitJsonErrorOr(json, msg, { error: 'missing_openai_key' }, () => ui.failure(new Error(msg)));
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
        exitJsonErrorOr(json, msg, { error: 'compose_failed' }, () =>
          ui.failure(e instanceof Error ? e : new Error(msg)),
        );
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
        exitJsonErrorOr(
          json,
          execResult.message,
          {
            error: 'openai_error',
            status: execResult.status,
            batchId,
            partial: runsOut,
          },
          () => ui.failure(new Error(execResult.message)),
        );
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
