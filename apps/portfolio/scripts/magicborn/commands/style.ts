import { parseArgs } from 'node:util';
import { createMagicbornCli } from '@/lib/magicborn/magicborn-cli-ui';
import { MAGICBORN_IMAGE_STYLE_BLOCK } from '@/lib/magicborn-prompts/style-block';
import { loadMagicbornCliConfig, mergeMagicbornCliConfig } from '../cli-config';
import { recommendCheapChatModel } from '../model-catalog';
import { fetchOpenAiChatText } from '../openai-chat-completion';
import { collectRagContext } from '../rag-helpers';

export function runStyleCommand(args: string[]): void {
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

export async function runStyleSuggest(args: string[]): Promise<void> {
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
  const completion = await fetchOpenAiChatText({
    apiKey,
    model,
    temperature: 0.4,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userPrompt },
    ],
  });
  if (!completion.ok) {
    console.error(completion.errorMessage);
    process.exit(1);
  }
  const suggested = completion.text;
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
