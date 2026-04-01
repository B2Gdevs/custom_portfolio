/**
 * Terminal output for `pnpm magicborn` / `MAGICBORN_CLI=1` (rag:ingest-style).
 *
 * Visual language (planning: magicborn-cli PLAN — “CLI visual language”):
 * - Domain ribbons (book, planning-pack, …) = at-a-glance command surface
 * - Verbs / args / flags / meta = consistent semantic colors when color is on
 * - Sections = magenta rules; long tasks = spinner + clear line
 */
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';

export type MagicbornGenerateTarget =
  | 'book'
  | 'app'
  | 'project'
  | 'planning-pack'
  | 'listen';

function shouldUseColor(): boolean {
  if (process.env.NO_COLOR != null && process.env.NO_COLOR !== '') {
    return false;
  }
  if (process.env.FORCE_COLOR != null && process.env.FORCE_COLOR !== '0') {
    return true;
  }
  return Boolean(process.stdout.isTTY);
}

/** Warnings and errors use stderr; color follows stderr TTY (or FORCE_COLOR). */
function shouldUseColorStderr(): boolean {
  if (process.env.NO_COLOR != null && process.env.NO_COLOR !== '') {
    return false;
  }
  if (process.env.FORCE_COLOR != null && process.env.FORCE_COLOR !== '0') {
    return true;
  }
  return Boolean(process.stderr.isTTY);
}

function c(enabled: boolean, fn: (s: string) => string, s: string): string {
  return enabled ? fn(s) : s;
}

function readAppVersion(): string {
  try {
    const pkgPath = path.join(resolvePortfolioAppRoot(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function formatMs(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/** Bracket label for logs/tests (no ANSI). */
export function magicbornDomainBracket(target: MagicbornGenerateTarget): string {
  return `[${target}]`;
}

/**
 * Ribbons match `magicborn --help` groups: asset/repo (yellow), Payload catalog (cyan).
 * See: global magicborn-cli PLAN — “CLI help groups & ribbons”.
 */
function domainRibbon(target: MagicbornGenerateTarget, color: boolean): string {
  const label = magicbornDomainBracket(target);
  switch (target) {
    case 'book':
    case 'planning-pack':
    case 'listen':
      return c(color, pc.yellow, label);
    case 'app':
    case 'project':
      return c(color, pc.cyan, label);
    default:
      return label;
  }
}

export type MagicbornCliConfig = {
  hasOpenAiKey: boolean;
  model: string;
  size: string;
  repoRoot: string;
  magicbornRoot: string;
};

export type MagicbornUsageLine = {
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
};

export function createMagicbornCli(enabled: boolean) {
  if (!enabled) {
    const noop = (): void => {};
    const noopAsync = async (): Promise<void> => {};
    return {
      banner: noop,
      configSnapshot: noop,
      section: noop,
      step: noop,
      info: noop,
      warn: noop,
      success: noop,
      dryRunFooter: noop,
      promptOnlyFooter: noop,
      failure: noop,
      withLongRunning: (_label: string, fn: () => Promise<void>) => fn(),
      withLongRunningResult: <T,>(_label: string, fn: () => Promise<T>) => fn(),
    };
  }

  const color = shouldUseColor();
  const colorErr = shouldUseColorStderr();
  const dim = (s: string) => c(color, pc.dim, s);
  const dimErr = (s: string) => c(colorErr, pc.dim, s);
  const bold = (s: string) => c(color, pc.bold, s);
  const grn = (s: string) => c(color, pc.green, s);
  const red = (s: string) => c(color, pc.red, s);
  const redErr = (s: string) => c(colorErr, pc.red, s);
  const cyn = (s: string) => c(color, pc.cyan, s);
  const yel = (s: string) => c(color, pc.yellow, s);
  const yelErr = (s: string) => c(colorErr, pc.yellow, s);
  const blu = (s: string) => c(color, pc.blue, s);
  const mag = (s: string) => c(color, pc.magenta, s);
  const verb = (s: string) => c(color, (t) => pc.bold(pc.cyan(t)), s);
  const arg = (s: string) => c(color, pc.yellow, s);
  const flag = (s: string) => c(color, pc.magenta, s);

  return {
    /** @param subtitle — short tail (e.g. `generate`); pass `domain` for media targets */
    banner(subtitle: string, domain?: MagicbornGenerateTarget) {
      const ver = readAppVersion();
      const root = resolvePortfolioAppRoot();
      console.log('');
      console.log(bold(`@portfolio/app@${ver}`));
      if (domain) {
        console.log(`  ${domainRibbon(domain, color)} ${verb(subtitle)} ${dim('· magicborn')}`);
      } else {
        console.log(dim(`  ${subtitle}`));
      }
      console.log(dim(`  ${path.resolve(root)}`));
      console.log('');
    },

    section(title: string) {
      const pad = Math.max(3, 56 - Math.min(title.length, 48));
      console.log(mag(`── ${title} ` + '─'.repeat(pad)));
    },

    configSnapshot(cfg: MagicbornCliConfig) {
      console.log(mag('── configuration ' + '─'.repeat(44)));
      console.log(
        `  ${dim('openai')}  ${cfg.hasOpenAiKey ? grn('OPENAI_API_KEY') + dim(' set') : red('OPENAI_API_KEY') + dim(' missing')}`,
      );
      console.log(`  ${dim('model')}   ${arg(cfg.model)}`);
      console.log(`  ${dim('size')}    ${arg(cfg.size)}`);
      console.log(`  ${dim('repo')}    ${dim(cfg.repoRoot)}`);
      console.log(`  ${dim('workdir')} ${arg(cfg.magicbornRoot)} ${dim('(gitignored)')}`);
      console.log('');
    },

    step(label: string) {
      const m = /^(\S+)(\s.*)?$/.exec(label);
      if (m && m[2]) {
        console.log(`  ${dim('›')} ${verb(m[1])}${m[2]}`);
      } else {
        console.log(`  ${dim('›')} ${verb(label)}`);
      }
    },

    info(line: string) {
      console.log(`  ${blu('ℹ')} ${dim(line)}`);
    },

    warn(line: string) {
      console.warn(`  ${yelErr('!')} ${yelErr(line)}`);
    },

    success(input: {
      runDir: string;
      imagePath: string;
      promptPath: string;
      manifestPath: string;
      durationMs: number;
      model: string;
      usage?: MagicbornUsageLine;
    }) {
      console.log(mag('── done ' + '─'.repeat(49)));
      console.log(`  ${grn('✓')} ${dim('wrote')} ${arg(input.imagePath)}`);
      console.log(`  ${dim('›')} ${flag('prompt')} ${dim(input.promptPath)}`);
      console.log(`  ${dim('›')} ${flag('manifest')} ${dim(input.manifestPath)}`);
      console.log(
        `  ${dim('›')} ${flag('model')} ${arg(input.model)} ${dim('·')} ${dim(formatMs(input.durationMs))}`,
      );
      const u = input.usage;
      if (u && (u.totalTokens != null || u.inputTokens != null || u.outputTokens != null)) {
        const parts: string[] = [];
        if (u.totalTokens != null) parts.push(`total_tokens≈${u.totalTokens}`);
        if (u.inputTokens != null) parts.push(`in=${u.inputTokens}`);
        if (u.outputTokens != null) parts.push(`out=${u.outputTokens}`);
        console.log(`  ${yel('spend')}  ${parts.join(' · ')} ${dim('(from OpenAI response)')}`);
      } else {
        console.log(`  ${dim('spend')}  ${dim('(usage not returned by Images API — check dashboard for cost)')}`);
      }
      console.log('');
      console.log(dim(`  run directory  ${input.runDir}`));
      console.log('');
    },

    dryRunFooter() {
      console.warn(`${yelErr('── dry-run ' + '─'.repeat(44))}`);
      console.warn(`  ${yelErr('!')} ${dimErr('no API call · no files written')}`);
      console.warn('');
    },

    promptOnlyFooter() {
      console.warn(`${dimErr('── prompt-only ' + '─'.repeat(41))}`);
      console.warn(
        `  ${dimErr('!')} ${dimErr('no API call · pass OPENAI_API_KEY and omit')} ${c(colorErr, pc.magenta, '--print-prompt')} ${dimErr('to generate')}`,
      );
      console.warn('');
    },

    failure(err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('');
      console.error(`  ${redErr('✖')} ${redErr(msg)}`);
      console.error('');
    },

    /** Long-running work with a TTY spinner; no-op when not a TTY. */
    async withLongRunning(label: string, fn: () => Promise<void>): Promise<void> {
      if (!process.stdout.isTTY || !color) {
        await fn();
        return;
      }
      const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      let i = 0;
      const tid = setInterval(() => {
        const fr = frames[i++ % frames.length];
        process.stdout.write(`\r  ${dim(fr)} ${verb(label)}${' '.repeat(8)}`);
      }, 90);
      try {
        await fn();
      } finally {
        clearInterval(tid);
        process.stdout.write('\r\x1b[K');
      }
    },

    async withLongRunningResult<T>(label: string, fn: () => Promise<T>): Promise<T> {
      if (!process.stdout.isTTY || !color) {
        return fn();
      }
      const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      let i = 0;
      const tid = setInterval(() => {
        const fr = frames[i++ % frames.length];
        process.stdout.write(`\r  ${dim(fr)} ${verb(label)}${' '.repeat(8)}`);
      }, 90);
      try {
        return await fn();
      } finally {
        clearInterval(tid);
        process.stdout.write('\r\x1b[K');
      }
    },
  };
}
