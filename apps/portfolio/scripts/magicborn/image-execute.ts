import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { createMagicbornCli } from '@/lib/magicborn/magicborn-cli-ui';
import { generateOpenAiImage } from '@/lib/magicborn/openai-image-generate';

import { resolveMagicbornRepoRoot } from './paths';
import type { GenerateManifestBase } from './generate-config';

export async function executeOpenAiImageRun(params: {
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
  const repoRoot = resolveMagicbornRepoRoot();
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
