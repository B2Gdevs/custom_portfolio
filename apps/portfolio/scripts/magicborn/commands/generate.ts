import path from 'node:path';
import { parseArgs } from 'node:util';
import { createMagicbornCli } from '@/lib/magicborn/magicborn-cli-ui';
import { getOpenAiImageModel } from '@/lib/magicborn/openai-image-generate';
import { loadMagicbornCliConfig } from '../cli-config';
import {
  type GenerateManifestBase,
  type GenerateTarget,
  generateParseOptions,
  parseImageSize,
} from '../generate-config';
import { executeOpenAiImageRun } from '../image-execute';
import { finalizeImagePrompt, resolvePromptBody, resolveSeedKey } from '../prompt-compose';
import { exitJsonError, exitJsonErrorOr } from '../cli-json';
import { resolveMagicbornRepoRoot } from '../paths';
import { collectRagContext, normalizeRagBookSlug } from '../rag-helpers';

export async function runGenerate(target: GenerateTarget, flagArgs: string[]): Promise<void> {
  const { values } = parseArgs({
    args: flagArgs,
    options: generateParseOptions,
    strict: true,
    allowPositionals: false,
  });

  const isCli = process.env.MAGICBORN_CLI === '1';
  const json = values.json === true;
  const ui = createMagicbornCli(isCli && !json);

  let size;
  try {
    size = parseImageSize(values.size);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    exitJsonError(json, msg, { error: 'bad_image_size' });
  }

  const raw = values.raw === true;
  const cliConfig = loadMagicbornCliConfig();
  let finalPrompt: string;
  try {
    finalPrompt = finalizeImagePrompt(target, values as Record<string, string | boolean | undefined>, raw, cliConfig);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    exitJsonErrorOr(json, msg, { error: 'prompt_compose_failed' }, () => ui.failure(e));
  }

  const model = cliConfig.models?.image?.trim() || getOpenAiImageModel();
  const repoRoot = resolveMagicbornRepoRoot();
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
    exitJsonErrorOr(json, msg, { error: 'missing_openai_key' }, () => ui.failure(new Error(msg)));
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
    exitJsonErrorOr(
      json,
      execResult.message,
      { error: 'openai_error', status: execResult.status },
      () => ui.failure(new Error(execResult.message)),
    );
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
