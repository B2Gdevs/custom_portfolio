#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command, Help, Option } from 'commander';
import {
  isMagicbornPlainMode,
  resolvePortfolioChatApiUrl,
  shouldOfferMagicbornTui,
} from '@magicborn/mb-cli-framework';
import { FISH_COMPLETION, ZSH_COMPLETION } from './completion-scripts.js';
import { findRepoRoot } from './repo-root.js';
import { forwardMagicborn } from './forward-portfolio.js';
import { runMagicbornEnv } from './magicborn-env.js';
import { runMagicbornUpdate } from './run-update.js';
import { runVendorAdd } from './vendor-add.js';
import { runMagicbornPnpm } from './pnpm-wrap.js';
import { printVendorCliHelp, runVendorForward, VENDOR_TOPIC_COMMANDS } from './vendor-run.js';
import { formatExternalOperatorCliHint } from './operator-external-cli-hint.js';
import { formatMagicbornRootHelp } from './help-format.js';
import { findRepoRootForVendor, getDefaultVendorId, loadVendorRegistry } from './vendor-registry.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @deprecated Top-level `users|org|tenant|blog` — forward with stderr deprecation. */
const vendorTopicForward = new Set<string>(VENDOR_TOPIC_COMMANDS);

function readBashCompletionScript(): string {
  const p = path.join(__dirname, '..', 'completions', 'magicborn.bash');
  return fs.readFileSync(p, 'utf8');
}

function ensureLine(text: string, line: string): string {
  return text.includes(line) ? text : `${text}\n${line}`;
}

/** Bash lines: `cdmb` → monorepo; optional `cdgt` → vendor/grime-time-site when present. */
function shellInitCdLinesBash(root: string): string[] {
  const grimetimePath = path.join(root, 'vendor', 'grime-time-site');
  const grimetimePosix = grimetimePath.replace(/\\/g, '/');
  const lines: string[] = [`alias cdmb='cd "$MAGICBORN_REPO"'`];
  if (fs.existsSync(grimetimePath)) {
    lines.push(`export GRIMETIME_REPO="${grimetimePosix}"`);
    lines.push(`alias cdgt='cd "$GRIMETIME_REPO"'`);
  }
  return lines;
}

function shellInitCdLinesFish(root: string): string[] {
  const grimetimePath = path.join(root, 'vendor', 'grime-time-site');
  const grimetimePosix = grimetimePath.replace(/\\/g, '/');
  const lines: string[] = [`alias cdmb 'cd $MAGICBORN_REPO'`];
  if (fs.existsSync(grimetimePath)) {
    lines.push(`set -gx GRIMETIME_REPO '${grimetimePosix}'`);
    lines.push(`alias cdgt 'cd $GRIMETIME_REPO'`);
  }
  return lines;
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
  const posixRoot = root.replace(/\\/g, '/');
  const blockLines = [
    start,
    '# magicborn --help: yellow=asset/repo · cyan=Payload · green=vendor · blue=OpenAI · magenta=model/style · gray=shell',
    `export MAGICBORN_REPO="${posixRoot}"`,
    'export PATH="$MAGICBORN_REPO/node_modules/.bin:$PATH"',
    ...shellInitCdLinesBash(root),
    '# Bash completion: source the repo script only — never `eval "$(magicborn completion bash)"` here (Node subprocess during .bashrc can hang Git Bash on Windows).',
    'if [[ -f "$MAGICBORN_REPO/packages/magicborn-cli/completions/magicborn.bash" ]]; then',
    '  # shellcheck source=/dev/null',
    '  source "$MAGICBORN_REPO/packages/magicborn-cli/completions/magicborn.bash"',
    'fi',
    "bind 'set show-all-if-ambiguous on' 2>/dev/null || true",
    "bind 'set completion-ignore-case on' 2>/dev/null || true",
    "bind 'set print-completions-horizontally off' 2>/dev/null || true",
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
  .configureHelp({
    formatHelp(cmd, helper) {
      if (!cmd.parent) {
        return formatMagicbornRootHelp(cmd);
      }
      // Delegate to built-in Help — `helper.formatHelp` would recurse (same override on `helper`).
      return Help.prototype.formatHelp.call(helper, cmd, helper);
    },
  });

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
  .description(
    'Extract scene-like ## sections from MDX (content/docs/magicborn/in-world/<slug>/ or --file)',
  )
  .argument('[slug]', 'Book folder under magicborn/in-world/')
  .option('--file <path>', 'Repo-relative or absolute .mdx path')
  .option('--slug <id>', 'Same as [slug]')
  .option('--all-headings', 'Include every ## block, not only scene-like titles', false)
  .option('--json', 'JSON only', false)
  .action(
    (
      slug: string | undefined,
      opts: { json?: boolean; file?: string; slug?: string; allHeadings?: boolean },
    ) => {
      const tail: string[] = [];
      if (opts.json) tail.push('--json');
      if (opts.allHeadings) tail.push('--all-headings');
      if (opts.file) tail.push('--file', opts.file);
      if (opts.slug) tail.push('--slug', opts.slug);
      if (slug) tail.push(slug);
      forward(['book', 'scenes', 'extract', ...tail]);
    },
  );

const booksCmd = program.command('books').description('Book pipeline (EPUB illustration gaps)');

const booksIllustrations = booksCmd
  .command('illustrations')
  .description('EPUB illustration gap scan');

booksIllustrations
  .command('scan')
  .description('List pending illustration slots + reading-order context (requires --epub)')
  .argument('[label]', 'Label for JSON output (defaults to EPUB basename)')
  .requiredOption('--epub <path>', 'Path to a .epub file')
  .option('--json', 'JSON on stdout', false)
  .action((label: string | undefined, opts: { epub: string; json?: boolean }) => {
    const tail: string[] = [...(label ? [label] : []), '--epub', opts.epub];
    if (opts.json) tail.push('--json');
    forward(['books', 'illustrations', 'scan', ...tail]);
  });

const siteCmd = program.command('site').description('Site branding (Payload site-media-assets)');

const siteLogo = siteCmd.command('logo').description('Site logo candidates (brand / site-logo)');

siteLogo
  .command('list')
  .description('List logo rows (contentScope=brand, contentSlug=site-logo)')
  .option('--json', 'JSON on stdout', false)
  .action((opts: { json?: boolean }) => {
    forward(['site', 'logo', 'list', ...(opts.json ? ['--json'] : [])]);
  });

siteLogo
  .command('set-active')
  .description('Mark one logo as current (isCurrent); clears siblings')
  .argument('<id>', 'site-media-assets document id')
  .option('--json', 'JSON on stdout', false)
  .action((id: string, opts: { json?: boolean }) => {
    const tail: string[] = [id];
    if (opts.json) tail.push('--json');
    forward(['site', 'logo', 'set-active', ...tail]);
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

program
  .command('batch')
  .description(
    'Creative batch: shared --style + scene list → multiple image runs + .magicborn/batches/<id>/batch.json (global-tooling-05-04)',
  )
  .requiredOption('--style <text>', 'Art direction / mood applied to every scene')
  .option('--target <kind>', 'book | app | project | planning-pack | listen', 'project')
  .option('--medium <m>', 'image only in v1', 'image')
  .option('--scenes <csv>', 'Comma-separated scene labels')
  .option('--scenes-file <path>', 'File with one scene per line (repo-relative ok)')
  .option('--continue-on-error', 'Continue after a failed scene', false)
  .option('--slug <slug>', 'Book or listen slug when target needs it')
  .option('--id <id>', 'Project or app id when target needs it')
  .option('--pack <id>', 'Planning pack id')
  .option('--print-prompt', 'Print composed prompts only (no API)', false)
  .option('--dry-run', 'Show composed prompts per scene; no API', false)
  .option('--json', 'JSON summary (batch manifest + paths)', false)
  .option('--raw', 'Omit Magicborn style block', false)
  .option('--size <size>', '1024x1024 | 1792x1024 | 1024x1792', '1024x1024')
  .option('--slot <id>', 'Media slot id for per-run manifests')
  .action(
    (opts: {
      style: string;
      target?: string;
      medium?: string;
      scenes?: string;
      scenesFile?: string;
      continueOnError?: boolean;
      slug?: string;
      id?: string;
      pack?: string;
      printPrompt?: boolean;
      dryRun?: boolean;
      json?: boolean;
      raw?: boolean;
      size?: string;
      slot?: string;
    }) => {
      forward([
        'batch',
        '--style',
        opts.style,
        '--target',
        opts.target ?? 'project',
        '--medium',
        opts.medium ?? 'image',
        ...(opts.scenes ? ['--scenes', opts.scenes] : []),
        ...(opts.scenesFile ? ['--scenes-file', opts.scenesFile] : []),
        ...(opts.continueOnError ? ['--continue-on-error'] : []),
        ...(opts.slug ? ['--slug', opts.slug] : []),
        ...(opts.id ? ['--id', opts.id] : []),
        ...(opts.pack ? ['--pack', opts.pack] : []),
        ...(opts.printPrompt ? ['--print-prompt'] : []),
        ...(opts.dryRun ? ['--dry-run'] : []),
        ...(opts.json ? ['--json'] : []),
        ...(opts.raw ? ['--raw'] : []),
        ...(opts.size ? ['--size', opts.size] : []),
        ...(opts.slot ? ['--slot', opts.slot] : []),
      ]);
    },
  );

const payloadCmd = program
  .command('payload')
  .description('Payload CMS discovery (reads apps/portfolio/payload.config)');

payloadCmd
  .command('collections')
  .description('List collection slugs (discovery smoke for global-tooling-02-05)')
  .option('--json', 'JSON output', false)
  .action((opts: { json?: boolean }) => {
    forward(['payload', 'collections', ...(opts.json ? ['--json'] : [])]);
  });

const payloadAppCmd = payloadCmd.command('app').description('Site app records in Payload (scaffold)');

payloadAppCmd
  .command('generate')
  .aliases(['gen'])
  .description(
    'Upsert site-app-records via local Payload (PAYLOAD_SECRET + DATABASE_URL, like seed scripts); --dry-run prints contract',
  )
  .option('--slug <id>', 'Registry app id (see FALLBACK_SITE_APPS / site catalog)')
  .option('--dry-run', 'Print JSON contract + resolved body', false)
  .option('--json', 'JSON on stdout for execute path', false)
  .action((opts: { dryRun?: boolean; slug?: string; json?: boolean }) => {
    const tail = ['payload', 'app', 'generate'];
    if (opts.dryRun) tail.push('--dry-run');
    if (opts.json) tail.push('--json');
    if (opts.slug) tail.push('--slug', opts.slug);
    forward(tail);
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

program
  .command('chat')
  .description(
    'Site Copilot in the terminal: default = isolated production .next-chat + next start + Ink (RAG-style step log on stderr). Flags: --dev (HMR), --rebuild, --no-server.',
  )
  .option('--dev', 'Use next dev + webpack (HMR) instead of production .next-chat + next start', false)
  .option('--rebuild', 'Force chat:build into .next-chat before next start', false)
  .option('--serve-rebuild', 'Alias for --rebuild', false)
  .option(
    '--no-server',
    'Open Ink only; POST to MAGICBORN_CHAT_* or default URL (no local Next process)',
    false,
  )
  .option('--dev-port <port>', 'Local server port (default 3010)', '3010')
  .addOption(new Option('--serve').hideHelp())
  .action(
    (opts: {
      dev?: boolean;
      rebuild?: boolean;
      serveRebuild?: boolean;
      noServer?: boolean;
      devPort?: string;
      serve?: boolean;
    }) => {
    void (async () => {
      try {
        if (!isMagicbornPlainMode() && shouldOfferMagicbornTui()) {
          const { runChatStubTui } = await import('./tui/run-chat-tui.js');
          await runChatStubTui({
            withDev: Boolean(opts.dev),
            rebuild: Boolean(opts.rebuild || opts.serveRebuild),
            noServer: Boolean(opts.noServer),
            devPort: opts.devPort,
          });
        } else {
          const url = resolvePortfolioChatApiUrl();
          console.log(
            `magicborn chat: use a TTY without MAGICBORN_PLAIN for Ink. Or POST ${url} with the Site Copilot JSON body (see vendor/mb-cli-framework README).`,
          );
        }
      } catch (e) {
        console.error(e instanceof Error ? e.message : e);
        process.exit(1);
      }
      process.exit(0);
    })();
  });

program
  .command('env')
  .description(
    'Show effective vendor scope and vendor .env merge (same env nested `magicborn vendor <id> …` uses)',
  )
  .option('--json', 'Machine-readable output', false)
  .action((opts: { json?: boolean }) => {
    process.exit(runMagicbornEnv(repoRootOrExit(), { json: Boolean(opts.json) }));
  });

program
  .command('shell-init')
  .argument('[shell]', 'bash | zsh | fish', 'bash')
  .option('--apply', 'Write/update shell rc file (bash only for now)', false)
  .description(
    'Print MAGICBORN_REPO + PATH (node_modules/.bin) + completion for your shell rc. After `pnpm install`, `magicborn` works from any cwd without a pnpm alias. --apply writes ~/.bashrc (bash only).',
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
      console.log(
        '# magicborn --help colors: yellow=asset/repo · cyan=Payload · green=vendor · blue=OpenAI · magenta=model/style · gray=shell',
      );
      console.log(`set -gx MAGICBORN_REPO '${posixRoot}'`);
      console.log('fish_add_path $MAGICBORN_REPO/node_modules/.bin');
      for (const line of shellInitCdLinesFish(root)) {
        console.log(line);
      }
      console.log(
        '# Optional: `magicborn completion fish > ~/.config/fish/completions/magicborn.fish`',
      );
      return;
    }
    console.log('# Add to ~/.bashrc or ~/.zshrc');
    console.log(
      '# magicborn --help: yellow=asset/repo · cyan=Payload catalog · green=vendor · blue=OpenAI · magenta=model/style · gray=shell',
    );
    console.log(`export MAGICBORN_REPO="${posixRoot}"`);
    console.log('export PATH="$MAGICBORN_REPO/node_modules/.bin:$PATH"');
    for (const line of shellInitCdLinesBash(root)) {
      console.log(line);
    }
    console.log(
      '# Tab completion: source repo file (no Node at login — avoids Git Bash hangs). Optional refresh: `magicborn completion bash` to stdout.',
    );
    console.log(
      'if [[ -f "$MAGICBORN_REPO/packages/magicborn-cli/completions/magicborn.bash" ]]; then',
    );
    console.log('  # shellcheck source=/dev/null');
    console.log('  source "$MAGICBORN_REPO/packages/magicborn-cli/completions/magicborn.bash"');
    console.log('fi');
    console.log("bind 'set show-all-if-ambiguous on' 2>/dev/null || true");
    console.log("bind 'set completion-ignore-case on' 2>/dev/null || true");
    console.log(
      "# Prefer column-major completion listing (top-to-bottom in each column); still a grid on wide terminals.",
    );
    console.log("bind 'set print-completions-horizontally off' 2>/dev/null || true");
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
  .description(
    'Print tab-completion script. Prefer: source "$MAGICBORN_REPO/packages/magicborn-cli/completions/magicborn.bash" from .bashrc (shell-init does this). This subcommand is for piping / updates.',
  )
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

void (async () => {
  const argvEarly = process.argv.slice(2);

  if (argvEarly.length === 0) {
    if (!isMagicbornPlainMode() && shouldOfferMagicbornTui()) {
      try {
        const { runMagicbornHomeTui } = await import('./tui/run-home-tui.js');
        await runMagicbornHomeTui();
      } catch (e) {
        console.error(e instanceof Error ? e.message : e);
        process.exit(1);
      }
      process.exit(0);
    }
    program.outputHelp();
    process.exit(0);
  }

  if (argvEarly[0] === 'pnpm') {
    process.exit(runMagicbornPnpm(argvEarly.slice(1)));
  }

  /** Claude Code / Codex: not wrapped — run installed binaries after `cd` into the repo (e.g. `cdmb`). */
  if (argvEarly[0] === 'claude' || argvEarly[0] === 'codex') {
    const cmd = argvEarly[0] as 'claude' | 'codex';
    const root = repoRootOrExit();
    console.error(formatExternalOperatorCliHint(cmd, argvEarly.slice(1), root));
    process.exit(2);
  }

  if (argvEarly[0] && vendorTopicForward.has(argvEarly[0])) {
    if (argvEarly[1] === '--help' || argvEarly[1] === '-h') {
      printVendorCliHelp();
      process.exit(0);
    }
    try {
      const rr = findRepoRootForVendor();
      const reg = loadVendorRegistry(rr);
      const def = getDefaultVendorId(reg, rr);
      console.warn(
        `[magicborn] Deprecated: use \`magicborn vendor ${def} ${argvEarly[0]} …\` (or \`magicborn vendor <id> ${argvEarly[0]} …\`).`,
      );
    } catch {
      console.warn(
        `[magicborn] Deprecated: top-level \`${argvEarly[0]}\` — use \`magicborn vendor <vendor-id> ${argvEarly[0]} …\`.`,
      );
    }
    process.exit(runVendorForward(argvEarly));
  }

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

  program.parse();
})();
