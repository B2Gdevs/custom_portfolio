/**
 * Terminal output for `pnpm magicborn` / `MAGICBORN_CLI=1` (rag:ingest-style).
 */
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';

function shouldUseColor(): boolean {
  return Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
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
    return {
      banner: noop,
      configSnapshot: noop,
      step: noop,
      success: noop,
      dryRunFooter: noop,
      promptOnlyFooter: noop,
      failure: noop,
    };
  }

  const color = shouldUseColor();
  const dim = (s: string) => c(color, pc.dim, s);
  const bold = (s: string) => c(color, pc.bold, s);
  const grn = (s: string) => c(color, pc.green, s);
  const red = (s: string) => c(color, pc.red, s);
  const cyn = (s: string) => c(color, pc.cyan, s);
  const yel = (s: string) => c(color, pc.yellow, s);

  return {
    banner(subtitle = 'magicborn') {
      const ver = readAppVersion();
      const root = resolvePortfolioAppRoot();
      console.log('');
      console.log(bold(`@portfolio/app@${ver}`) + dim(`  ${subtitle}`));
      console.log(dim(`  ${path.resolve(root)}`));
      console.log('');
    },

    configSnapshot(cfg: MagicbornCliConfig) {
      console.log(dim('── configuration ' + '─'.repeat(44)));
      console.log(
        `  ${dim('openai')}  ${cfg.hasOpenAiKey ? grn('OPENAI_API_KEY') + dim(' set') : red('OPENAI_API_KEY missing')}`,
      );
      console.log(`  ${dim('model')}   ${cyn(cfg.model)}`);
      console.log(`  ${dim('size')}    ${cfg.size}`);
      console.log(`  ${dim('repo')}    ${dim(cfg.repoRoot)}`);
      console.log(`  ${dim('workdir')} ${cfg.magicbornRoot} ${dim('(gitignored)')}`);
      console.log('');
    },

    step(label: string) {
      console.log(`  ${dim('›')} ${label}`);
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
      console.log(dim('── done ' + '─'.repeat(49)));
      console.log(`  ${grn('✓')} wrote ${dim(input.imagePath)}`);
      console.log(`  ${dim('›')} ${dim('prompt')} ${input.promptPath}`);
      console.log(`  ${dim('›')} ${dim('manifest')} ${input.manifestPath}`);
      console.log(`  ${dim('›')} ${dim('model')} ${input.model} · ${formatMs(input.durationMs)}`);
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
      console.log(dim('── dry-run ' + '─'.repeat(44)));
      console.log(`  ${yel('!')} no API call · no files written`);
      console.log('');
    },

    promptOnlyFooter() {
      console.log(dim('── prompt-only ' + '─'.repeat(41)));
      console.log(`  ${dim('!')} no API call · pass OPENAI_API_KEY and omit ${dim('--print-prompt')} to generate`);
      console.log('');
    },

    failure(err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log('');
      console.log(`  ${red('✖')} ${msg}`);
      console.log('');
    },
  };
}
