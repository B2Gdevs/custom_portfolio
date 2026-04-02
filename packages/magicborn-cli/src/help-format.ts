/**
 * Grouped, semantic colors for `magicborn --help` (root command only).
 * Subcommand help still uses Commander’s default formatter.
 */
import type { Command } from 'commander';
import pc from 'picocolors';

function helpColorOn(): boolean {
  if (process.env.NO_COLOR != null && process.env.NO_COLOR !== '') {
    return false;
  }
  if (process.env.FORCE_COLOR != null && process.env.FORCE_COLOR !== '0') {
    return true;
  }
  return Boolean(process.stdout.isTTY);
}

const GROUPS: Array<{
  title: string;
  style: (s: string) => string;
  names: string[];
}> = [
  {
    title: 'Asset & repo (books, planning packs, listen — local + CMS, not Payload-only CRUD)',
    style: (s) => (helpColorOn() ? pc.bold(pc.yellow(s)) : s),
    names: ['book', 'planning-pack', 'listen'],
  },
  {
    title: 'Payload CMS catalog (site apps, projects, config discovery)',
    style: (s) => (helpColorOn() ? pc.bold(pc.cyan(s)) : s),
    names: ['app', 'project', 'payload'],
  },
  {
    title: 'Vendor CLIs (`magicborn vendor <id> …`)',
    style: (s) => (helpColorOn() ? pc.bold(pc.green(s)) : s),
    names: ['vendor'],
  },
  {
    title: 'OpenAI & chat (API probes; Ink chat → /api/chat; default prod .next-chat + start)',
    style: (s) => (helpColorOn() ? pc.bold(pc.blue(s)) : s),
    names: ['openai', 'chat'],
  },
  {
    title: 'Model & style (CLI preferences, RAG defaults)',
    style: (s) => (helpColorOn() ? pc.bold(pc.magenta(s)) : s),
    names: ['model', 'style'],
  },
  {
    title: 'Shell, env, completion, updates',
    style: (s) => (helpColorOn() ? pc.bold(pc.gray(s)) : s),
    names: ['completion', 'shell-init', 'update', 'env'],
  },
];

function descStyle(s: string): string {
  return helpColorOn() ? pc.dim(pc.magenta(s)) : s;
}

function row(leftRaw: string, right: string, leftPaint: (s: string) => string): string {
  const pad = 26;
  const gap = leftRaw.length < pad ? ' '.repeat(pad - leftRaw.length) : ' ';
  return `  ${leftPaint(leftRaw)}${gap} ${descStyle(right)}`;
}

function isListedTopCommand(c: Command): boolean {
  return c.name() !== '__complete';
}

function findCommand(cmd: Command, name: string): Command | undefined {
  return cmd.commands.find((c) => c.name() === name && isListedTopCommand(c));
}

export function formatMagicbornRootHelp(program: Command): string {
  const h = helpColorOn();
  const title = h ? pc.bold(pc.cyan(program.name())) : program.name();
  const lines: string[] = [];
  lines.push(`${title} — ${program.description()}`);
  const ver = program.version();
  if (ver) {
    lines.push(`${h ? pc.bold('Version:') : 'Version:'} ${ver}`);
  }
  lines.push('');
  lines.push(`${h ? pc.bold('Usage:') : 'Usage:'} ${program.name()} [command] [options]`);
  lines.push('');

  const used = new Set<string>();

  for (const g of GROUPS) {
    const rows: string[] = [];
    for (const name of g.names) {
      const sub = findCommand(program, name);
      if (!sub) continue;
      used.add(name);
      const left = sub.name() + (sub.aliases()[0] ? `|${sub.aliases()[0]}` : '');
      rows.push(row(left, sub.description(), g.style));
    }
    if (rows.length === 0) continue;
    lines.push(g.style(g.title));
    lines.push(...rows);
    lines.push('');
  }

  const rest = program.commands.filter((c) => isListedTopCommand(c) && !used.has(c.name()));
  if (rest.length > 0) {
    const hdr = h ? pc.bold(pc.gray('Other commands')) : 'Other commands';
    lines.push(hdr);
    for (const sub of rest.sort((a, b) => a.name().localeCompare(b.name()))) {
      lines.push(row(sub.name(), sub.description(), (s) => (h ? pc.gray(s) : s)));
    }
    lines.push('');
  }

  lines.push(h ? pc.bold(pc.gray('Workspace passthrough')) : 'Workspace passthrough');
  lines.push(
    row(
      'pnpm <args>',
      'Run pnpm with cwd = nearest package.json from $PWD, else monorepo root',
      (s) => (h ? pc.dim(pc.gray(s)) : s),
    ),
  );
  lines.push('');

  lines.push(h ? pc.bold('Global options:') : 'Global options:');
  lines.push('  -V, --version     output the version number');
  lines.push('  -h, --help        display help for command');
  lines.push('');

  lines.push(h ? pc.bold(pc.gray('Examples')) : 'Examples');
  lines.push(descStyle('  magicborn book generate --slug my-book --dry-run'));
  lines.push(descStyle('  magicborn payload collections --json'));
  lines.push(descStyle('  magicborn payload app generate --dry-run'));
  lines.push(descStyle('  magicborn vendor grimetime doctor'));
  lines.push(descStyle('  magicborn vendor list'));
  lines.push(descStyle('  magicborn pnpm --filter @portfolio/app run build'));
  lines.push('');

  return lines.join('\n');
}
