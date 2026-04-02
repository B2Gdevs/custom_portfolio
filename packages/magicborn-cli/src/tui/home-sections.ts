import type { CliTheme } from '@magicborn/mb-cli-framework';

export type HomeCommandRow = { cmd: string; hint: string };

export type HomeCommandSection = {
  id: string;
  title: string;
  themeKey: keyof CliTheme;
  rows: HomeCommandRow[];
};

/** Vertical catalog shown on first paint and in `help`. */
export const HOME_COMMAND_SECTIONS: HomeCommandSection[] = [
  {
    id: 'local',
    title: 'Local / packaging',
    themeKey: 'asset',
    rows: [
      { cmd: 'book', hint: 'generate · scenes list · scenes extract …' },
      { cmd: 'planning-pack generate', hint: 'planning pack image flow' },
      { cmd: 'listen generate', hint: 'listen lane imagery' },
      { cmd: 'style', hint: 'show · set · clear · suggest' },
      { cmd: 'model', hint: 'get · set · recommend · list · config' },
    ],
  },
  {
    id: 'payload',
    title: 'Payload CMS',
    themeKey: 'payload',
    rows: [
      { cmd: 'payload collections', hint: 'add --json for machine output' },
      { cmd: 'payload app generate', hint: '--slug <id> · --dry-run' },
    ],
  },
  {
    id: 'vendors',
    title: 'Vendors',
    themeKey: 'vendor',
    rows: [
      { cmd: 'vendor list', hint: 'human table · --json for registry blob' },
      { cmd: 'vendor use <id>', hint: 'set default vendor scope' },
      { cmd: 'vendor <id> …', hint: 'forward to vendor CLI' },
    ],
  },
  {
    id: 'apis',
    title: 'APIs & chat',
    themeKey: 'openai',
    rows: [
      { cmd: 'openai', hint: 'status · models · projects · help' },
      { cmd: 'chat', hint: 'Site Copilot (full-screen TTY, returns here after quit)' },
    ],
  },
  {
    id: 'shell',
    title: 'Shell & meta',
    themeKey: 'shell',
    rows: [
      { cmd: 'pnpm …', hint: 'passthrough (see magicborn --help)' },
      { cmd: 'update', hint: 'refresh install + rebuild reader/cli' },
      { cmd: 'completion bash|zsh|fish', hint: 'install tab completion' },
      { cmd: 'env', hint: 'scoped vendor .env + MAGICBORN_VENDOR_* (same merge as vendor CLI)' },
    ],
  },
];
