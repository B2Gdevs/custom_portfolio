#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { FISH_COMPLETION, ZSH_COMPLETION } from './completion-scripts.js';
import { findRepoRoot } from './repo-root.js';
import { forwardMagicborn } from './forward-portfolio.js';
import { runMagicbornUpdate } from './run-update.js';
import { runVendorAdd } from './vendor-add.js';
import { runMagicbornPnpm } from './pnpm-wrap.js';
import { printVendorCliHelp, runVendorForward, VENDOR_TOPIC_COMMANDS } from './vendor-run.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const argvEarly = process.argv.slice(2);
if (argvEarly[0] === 'pnpm') {
  process.exit(runMagicbornPnpm(argvEarly.slice(1)));
}

/** Top-level aliases: `magicborn users` === `magicborn vendor users` (same vendor CLI). */
const vendorTopicForward = new Set<string>(VENDOR_TOPIC_COMMANDS);
if (argvEarly[0] && vendorTopicForward.has(argvEarly[0])) {
  if (argvEarly[1] === '--help' || argvEarly[1] === '-h') {
    printVendorCliHelp();
    process.exit(0);
  }
  process.exit(runVendorForward(argvEarly));
}

/** `vendor add` stays in Commander; everything else forwards to the vendor package CLI. */
if (argvEarly[0] === 'vendor') {
  const rest = argvEarly.slice(1);
  if (rest[0] !== 'add') {
    if (rest.length === 0 || rest[0] === '--help' || rest[0] === '-h') {
      printVendorCliHelp();
      process.exit(0);
    }
    process.exit(runVendorForward(rest));
  }
}

function readBashCompletionScript(): string {
  const p = path.join(__dirname, '..', 'completions', 'magicborn.bash');
  return fs.readFileSync(p, 'utf8');
}

function ensureLine(text: string, line: string): string {
  return text.includes(line) ? text : `${text}\n${line}`;
}

function applyShellInitBash(root: string): { updated: boolean; filePaths: string[] } {
  const home = process.env.HOME || process.env.USERPROFILE;
  if (!home) {
    throw new Error('HOME is not set; cannot auto-apply shell init.');
  }
  const bashrcPath = path.join(home, '.bashrc');
  const bashProfilePath = path.join(home, '.bash_profile');
  const start = '# >>> magicborn shell >>>';
  const end = '# <<< magicborn shell <<<';
  const blockLines = [
    start,
    `export MAGICBORN_REPO="${root.replace(/\\/g, '/')}"`,
    'alias magicborn=\'pnpm -s magicborn\'',
    'eval "$(pnpm -s magicborn completion bash 2>/dev/null)"',
    "bind 'set show-all-if-ambiguous on' 2>/dev/null || true",
    "bind 'set completion-ignore-case on' 2>/dev/null || true",
    end,
  ];
  const nextBlock = blockLines.join('\n');
  const prev = fs.existsSync(bashrcPath) ? fs.readFileSync(bashrcPath, 'utf8') : '';
  const hasBlock = prev.includes(start) && prev.includes(end);
  let next = prev;
  if (hasBlock) {
    next = prev.replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'm'), nextBlock);
  } else {
    next = prev.trimEnd();
    next = next.length > 0 ? `${next}\n\n${nextBlock}\n` : `${nextBlock}\n`;
  }
  next = ensureLine(next, '');
  let updated = false;
  if (next !== prev) {
    fs.writeFileSync(bashrcPath, next, 'utf8');
    updated = true;
  }
  const sourceLine = '[[ -f ~/.bashrc ]] && source ~/.bashrc';
  const profilePrev = fs.existsSync(bashProfilePath) ? fs.readFileSync(bashProfilePath, 'utf8') : '';
  const profileNext = ensureLine(profilePrev.trimEnd(), sourceLine);
  if (profileNext !== profilePrev) {
    fs.writeFileSync(bashProfilePath, `${profileNext}\n`, 'utf8');
    updated = true;
  }
  return { updated, filePaths: [bashrcPath, bashProfilePath] };
}

const program = new Command();
program
  .name('magicborn')
  .description(
    'Magicborn operator CLI — media, scenes, app/project lists, OpenAI account probes, pnpm passthrough, vendor repos',
  )
  .version('0.5.0')
  .addHelpText(
    'after',
    `
Pass-through:
  magicborn pnpm <args>    Run pnpm with cwd = nearest package.json (from $PWD), else monorepo root
  Examples: magicborn pnpm install
            magicborn pnpm --filter @portfolio/app run build
            (from apps/portfolio) magicborn pnpm run test:unit

  magicborn vendor …       Forward to a registered vendor CLI (default: grimetime). See: magicborn vendor --help
  magicborn users|org|tenant|blog …   Top-level aliases (same as magicborn vendor <cmd> …)
`,
  );

function repoRootOrExit(): string {
  try {
    return findRepoRoot();
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

function forward(argv: string[]): void {
  const code = forwardMagicborn(repoRootOrExit(), argv);
  process.exit(code);
}

function forwardGenerateArgs(opts: {
  slug?: string;
  id?: string;
  pack?: string;
  prompt?: string;
  seed?: string;
  sceneKey?: string;
  sceneText?: string;
  printPrompt?: boolean;
  json?: boolean;
  dryRun?: boolean;
  raw?: boolean;
  size?: string;
  slot?: string;
  withRag?: boolean;
  book?: string;
  ragQuery?: string;
}): string[] {
  const args: string[] = [];
  if (opts.slug) args.push('--slug', opts.slug);
  if (opts.id) args.push('--id', opts.id);
  if (opts.pack) args.push('--pack', opts.pack);
  if (opts.prompt) args.push('--prompt', opts.prompt);
  if (opts.seed) args.push('--seed', opts.seed);
  if (opts.sceneKey) args.push('--scene-key', opts.sceneKey);
  if (opts.sceneText) args.push('--scene-text', opts.sceneText);
  if (opts.printPrompt) args.push('--print-prompt');
  if (opts.json) args.push('--json');
  if (opts.dryRun) args.push('--dry-run');
  if (opts.raw) args.push('--raw');
  if (opts.size) args.push('--size', opts.size);
  if (opts.slot) args.push('--slot', opts.slot);
  if (opts.withRag) args.push('--with-rag');
  if (opts.book) args.push('--book', opts.book);
  if (opts.ragQuery) args.push('--rag-query', opts.ragQuery);
  return args;
}

function attachGenerateOptions(cmd: Command): Command {
  return cmd
    .option('--prompt <text>', 'Creative instructions (mood, subject — merged into the composed prompt)')
    .option('--seed <key>', 'Curated seed key (`magicborn book scenes list`)')
    .option('--scene-key <key>', 'Deprecated: use --seed')
    .option('--scene-text <text>', 'Deprecated: use --prompt')
    .option('--print-prompt', 'Print composed prompt only (no OpenAI call)', false)
    .option('--dry-run', 'Show prompt and config; no API call', false)
    .option('--json', 'JSON on stdout', false)
    .option('--raw', 'Omit Magicborn style block', false)
    .option('--size <size>', '1024x1024 | 1792x1024 | 1024x1792', '1024x1024')
    .option('--slot <id>', 'Media slot id for manifest')
    .option('--with-rag', 'Inject retrieval context (uses CLI/default RAG config)', false)
    .option('--book <slug>', 'Book slug for RAG scoping')
    .option('--rag-query <text>', 'Override retrieval query');
}

const book = program.command('book').description('Book media and scene seeds');

attachGenerateOptions(
  book
    .command('generate')
    .aliases(['gen'])
    .description('Generate book imagery (Magicborn style unless --raw)')
    .option('--slug <slug>', 'Book slug for context + manifest'),
).action((opts) => {
  forward(['book', 'generate', ...forwardGenerateArgs(opts)]);
});

const scenes = book.command('scenes').description('List or extract scene prompts');

scenes
  .command('list')
  .description('List curated scene seed keys (for --seed)')
  .option('--json', 'JSON only', false)
  .action((opts: { json?: boolean }) => {
    const tail: string[] = [];
    if (opts.json) tail.push('--json');
    forward(['book', 'scenes', 'list', ...tail]);
  });

scenes
  .command('extract')
  .description('Extract scenes from manuscript (not implemented yet)')
  .argument('[slug]', 'Optional book slug')
  .option('--json', 'JSON only', false)
  .action((slug: string | undefined, opts: { json?: boolean }) => {
    const tail: string[] = [];
    if (opts.json) tail.push('--json');
    if (slug) tail.push(slug);
    forward(['book', 'scenes', 'extract', ...tail]);
  });

const appCmd = program.command('app').description('Site /apps catalog');

appCmd
  .command('list')
  .description('List app ids (from site app registry seed)')
  .option('--json', 'JSON only', false)
  .action((opts: { json?: boolean }) => {
    forward(['app', 'list', ...(opts.json ? ['--json'] : [])]);
  });

attachGenerateOptions(
  appCmd
    .command('generate')
    .aliases(['gen'])
    .description('Generate imagery for an app tile / cover')
    .option('--id <id>', 'App id (see: magicborn app list)'),
).action((opts) => {
  forward(['app', 'generate', ...forwardGenerateArgs(opts)]);
});

const projectCmd = program.command('project').description('Portfolio projects');

projectCmd
  .command('list')
  .description('List project slugs (from content/projects)')
  .option('--json', 'JSON only', false)
  .action((opts: { json?: boolean }) => {
    forward(['project', 'list', ...(opts.json ? ['--json'] : [])]);
  });

attachGenerateOptions(
  projectCmd
    .command('generate')
    .aliases(['gen'])
    .description('Generate project cover / hero imagery')
    .option('--id <slug>', 'Project slug (see: magicborn project list)'),
).action((opts) => {
  forward(['project', 'generate', ...forwardGenerateArgs(opts)]);
});

const planningPack = program.command('planning-pack').description('Planning pack media');

attachGenerateOptions(
  planningPack
    .command('generate')
    .aliases(['gen'])
    .description('Planning pack / embed imagery')
    .option('--pack <id>', 'Pack id or label'),
).action((opts) => {
  forward(['planning-pack', 'generate', ...forwardGenerateArgs(opts)]);
});

const listenCmd = program.command('listen').description('Listen / BandLab catalog');

attachGenerateOptions(
  listenCmd
    .command('generate')
    .aliases(['gen'])
    .description('Listen row imagery')
    .option('--slug <slug>', 'Listen row slug'),
).action((opts) => {
  forward(['listen', 'generate', ...forwardGenerateArgs(opts)]);
});

const vendorCmd = program
  .command('vendor')
  .description(
    'Vendor repos: `add` registers a submodule; other args forward to the vendor CLI (see `magicborn vendor --help`)',
  );

vendorCmd
  .command('add')
  .argument('<url>', 'GitHub https or git@ URL')
  .option('-n, --name <name>', 'Directory name under vendor/ (default: repo name)')
  .option('--apply', 'Run git submodule add and update pnpm-workspace.yaml', false)
  .action((url: string, opts: { name?: string; apply: boolean }) => {
    runVendorAdd({ repoRoot: repoRootOrExit(), url, name: opts.name, apply: opts.apply });
  });

for (const topic of VENDOR_TOPIC_COMMANDS) {
  program
    .command(topic)
    .description(`Vendor CLI: forward to default vendor (same as: magicborn vendor ${topic} …)`)
    .action(() => {
      console.error(
        `magicborn: internal error: "${topic}" must be handled before Commander.parse; please report.`,
      );
      process.exit(1);
    });
}

program
  .command('shell-init')
  .argument('[shell]', 'bash | zsh | fish', 'bash')
  .option('--apply', 'Write/update shell rc file (bash only for now)', false)
  .description(
    'Print PATH + completion lines for your shell rc (after `pnpm install`, `magicborn` lives in node_modules/.bin)',
  )
  .action((shell: string, opts: { apply?: boolean }) => {
    const root = repoRootOrExit();
    const posixRoot = root.replace(/\\/g, '/');
    const s = shell.trim().toLowerCase();
    if (opts.apply) {
      if (s !== 'bash') {
        console.error('--apply currently supports bash only.');
        process.exit(1);
      }
      const result = applyShellInitBash(root);
      console.log(
        result.updated
          ? `Updated ${result.filePaths.join(', ')}. Restart shell (or: source ~/.bashrc).`
          : `No changes needed in ${result.filePaths.join(', ')}.`,
      );
      return;
    }
    if (s === 'fish') {
      console.log('# Add to ~/.config/fish/config.fish');
      console.log(`set -gx MAGICBORN_REPO '${posixRoot}'`);
      console.log('fish_add_path $MAGICBORN_REPO/node_modules/.bin');
      console.log(
        '# Optional: `magicborn completion fish > ~/.config/fish/completions/magicborn.fish`',
      );
      return;
    }
    console.log('# Add to ~/.bashrc or ~/.zshrc');
    console.log(`export MAGICBORN_REPO="${posixRoot}"`);
    console.log('alias magicborn=\'pnpm -s magicborn\'');
    console.log('export PATH="$MAGICBORN_REPO/node_modules/.bin:$PATH"');
    console.log('eval "$(pnpm -s magicborn completion bash)"');
    console.log("bind 'set show-all-if-ambiguous on' 2>/dev/null || true");
    console.log("bind 'set completion-ignore-case on' 2>/dev/null || true");
  });

program
  .command('__complete', { hidden: true })
  .argument('<topic>', 'e.g. seed-keys, book-slugs')
  .action((topic: string) => {
    forward(['__complete', topic]);
  });

const styleCmd = program.command('style').description('Magicborn style prompt block');

styleCmd.command('show').description('Show effective style block').action(() => {
  forward(['style', 'show']);
});

styleCmd
  .command('set')
  .argument('<text...>', 'Style prompt block')
  .description('Set CLI-only style override')
  .action((text: string[]) => {
    forward(['style', 'set', text.join(' ')]);
  });

styleCmd.command('clear').description('Clear CLI-only style override').action(() => {
  forward(['style', 'clear']);
});

styleCmd
  .command('suggest')
  .option('--book <slug>', 'Book slug focus for RAG context')
  .option('--query <text>', 'Prompt goal for style suggestion')
  .option('--model <id>', 'Chat model id override')
  .option('--cheap', 'Use cheapest default suggestion model', false)
  .option('--save', 'Save suggestion as active style block', false)
  .option('--json', 'JSON output', false)
  .description('Suggest a style block from RAG context')
  .action((opts: { book?: string; query?: string; model?: string; cheap?: boolean; save?: boolean; json?: boolean }) => {
    const tail: string[] = ['style', 'suggest'];
    if (opts.book) tail.push('--book', opts.book);
    if (opts.query) tail.push('--query', opts.query);
    if (opts.model) tail.push('--model', opts.model);
    if (opts.cheap) tail.push('--cheap');
    if (opts.save) tail.push('--save');
    if (opts.json) tail.push('--json');
    forward(tail);
  });

const modelCmd = program.command('model').description('CLI-only model preferences');

modelCmd.command('get').description('Show effective model preferences').action(() => {
  forward(['model', 'get']);
});

modelCmd
  .command('set')
  .argument('<task>', 'image | chat | embedding | video')
  .argument('<modelId>', 'Provider model id')
  .description('Set model for one CLI task')
  .action((task: string, modelId: string) => {
    forward(['model', 'set', task, modelId]);
  });

modelCmd
  .command('recommend')
  .argument('[task]', 'image | chat | embedding | video', 'chat')
  .description('Show recommended low-cost/default model')
  .action((task: string) => {
    forward(['model', 'recommend', task]);
  });

modelCmd
  .command('list')
  .option('--live', 'Fetch model ids from OpenAI /v1/models')
  .description('List known model ids by category')
  .action((opts: { live?: boolean }) => {
    const tail: string[] = [];
    if (opts.live) tail.push('--live');
    forward(['model', 'list', ...tail]);
  });

modelCmd
  .command('config')
  .option('--rag-enabled <bool>', '1/0 or true/false')
  .option('--rag-book <slug>', 'Default book slug for RAG commands')
  .option('--rag-max-hits <n>', 'Default retrieval hit count')
  .option('--rag-auto-book <bool>', 'Auto-enable RAG on book generate')
  .option('--suggest-model <id>', 'Default model for style suggest')
  .option('--cheap-suggest-model <id>', 'Cheapest model for --cheap suggest')
  .description('Update CLI-only RAG defaults')
  .action((opts: {
    ragEnabled?: string;
    ragBook?: string;
    ragMaxHits?: string;
    ragAutoBook?: string;
    suggestModel?: string;
    cheapSuggestModel?: string;
  }) => {
    const tail: string[] = ['model', 'config'];
    if (opts.ragEnabled) tail.push('--rag-enabled', opts.ragEnabled);
    if (opts.ragBook) tail.push('--rag-book', opts.ragBook);
    if (opts.ragMaxHits) tail.push('--rag-max-hits', opts.ragMaxHits);
    if (opts.ragAutoBook) tail.push('--rag-auto-book', opts.ragAutoBook);
    if (opts.suggestModel) tail.push('--suggest-model', opts.suggestModel);
    if (opts.cheapSuggestModel) tail.push('--cheap-suggest-model', opts.cheapSuggestModel);
    forward(tail);
  });

const openaiCmd = program
  .command('openai')
  .option('--json', 'JSON on stdout (default subcommand: status)', false)
  .description('OpenAI API / org probes (keys from env)')
  .action((opts: { json?: boolean }) => {
    forward(['openai', 'status', ...(opts.json ? ['--json'] : [])]);
  });

openaiCmd
  .command('help')
  .description('Print openai subcommand usage')
  .action(() => {
    forward(['openai', 'help']);
  });

openaiCmd
  .command('status')
  .option('--json', 'JSON on stdout', false)
  .description('GET /v1/models with OPENAI_API_KEY; show rate-limit and org headers')
  .action((opts: { json?: boolean }) => {
    forward(['openai', 'status', ...(opts.json ? ['--json'] : [])]);
  });

openaiCmd
  .command('models')
  .option('--json', 'JSON on stdout', false)
  .option('--category <name>', 'Filter: image | chat | embedding | video | text')
  .description('List accessible model ids (same auth as status)')
  .action((opts: { json?: boolean; category?: string }) => {
    const tail: string[] = ['openai', 'models'];
    if (opts.json) tail.push('--json');
    if (opts.category) tail.push('--category', opts.category);
    forward(tail);
  });

openaiCmd
  .command('projects')
  .option('--json', 'JSON on stdout', false)
  .option('--include-archived', 'Include archived projects', false)
  .option('--limit <n>', '1–100 (default 20)')
  .description('List organization projects (requires OPENAI_ADMIN_KEY)')
  .action((opts: { json?: boolean; includeArchived?: boolean; limit?: string }) => {
    const tail: string[] = ['openai', 'projects'];
    if (opts.json) tail.push('--json');
    if (opts.includeArchived) tail.push('--include-archived');
    if (opts.limit) tail.push('--limit', opts.limit);
    forward(tail);
  });

program
  .command('update')
  .description(
    'Run pnpm install at the monorepo root and rebuild @magicborn/cli + @portfolio/repub-builder (get latest CLI + reader dist after git pull)',
  )
  .option('--pull', 'Run git pull --ff-only in the repo root first', false)
  .action((opts: { pull?: boolean }) => {
    process.exit(runMagicbornUpdate(repoRootOrExit(), { pull: opts.pull }));
  });

program
  .command('completion')
  .description('Print tab-completion script (install: eval "$(magicborn completion bash)")')
  .argument('<shell>', 'bash | zsh | fish')
  .action((shell: string) => {
    const s = shell.trim().toLowerCase();
    if (s === 'bash') {
      process.stdout.write(readBashCompletionScript());
      return;
    }
    if (s === 'fish') {
      process.stdout.write(FISH_COMPLETION);
      return;
    }
    if (s === 'zsh') {
      process.stdout.write(ZSH_COMPLETION);
      return;
    }
    console.error('Use: magicborn completion bash | zsh | fish');
    process.exit(1);
  });

program.parse();
