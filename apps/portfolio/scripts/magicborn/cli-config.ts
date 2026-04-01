import fs from 'node:fs';
import path from 'node:path';

export type CliModelTask = 'image' | 'chat' | 'embedding' | 'video';

export type MagicbornCliConfig = {
  styleBlock?: string;
  models?: Partial<Record<CliModelTask, string>>;
  rag?: {
    enabled?: boolean;
    defaultBookSlug?: string;
    maxHits?: number;
    useRagForBookGenerate?: boolean;
    suggestModel?: string;
    cheapSuggestModel?: string;
  };
};

function getRepoRoot(): string {
  return path.resolve(process.cwd(), '..', '..');
}

function getConfigPath(): string {
  return path.join(getRepoRoot(), '.magicborn', 'cli-config.toml');
}

function getLegacyJsonPath(): string {
  return path.join(getRepoRoot(), '.magicborn', 'cli-config.json');
}

function tomlEscapeString(value: string): string {
  return `"${value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
    .replace(/"/g, '\\"')}"`;
}

function toToml(config: MagicbornCliConfig): string {
  const lines: string[] = [];
  if (config.styleBlock && config.styleBlock.trim()) {
    lines.push(`styleBlock = ${tomlEscapeString(config.styleBlock)}`);
    lines.push('');
  }
  if (config.models && Object.keys(config.models).length > 0) {
    lines.push('[models]');
    for (const [k, v] of Object.entries(config.models)) {
      if (typeof v === 'string' && v.trim()) {
        lines.push(`${k} = ${tomlEscapeString(v)}`);
      }
    }
    lines.push('');
  }
  if (config.rag && Object.keys(config.rag).length > 0) {
    lines.push('[rag]');
    if (typeof config.rag.enabled === 'boolean') lines.push(`enabled = ${config.rag.enabled}`);
    if (typeof config.rag.defaultBookSlug === 'string' && config.rag.defaultBookSlug.trim()) {
      lines.push(`defaultBookSlug = ${tomlEscapeString(config.rag.defaultBookSlug)}`);
    }
    if (typeof config.rag.maxHits === 'number' && Number.isFinite(config.rag.maxHits)) {
      lines.push(`maxHits = ${Math.max(1, Math.floor(config.rag.maxHits))}`);
    }
    if (typeof config.rag.useRagForBookGenerate === 'boolean') {
      lines.push(`useRagForBookGenerate = ${config.rag.useRagForBookGenerate}`);
    }
    if (typeof config.rag.suggestModel === 'string' && config.rag.suggestModel.trim()) {
      lines.push(`suggestModel = ${tomlEscapeString(config.rag.suggestModel)}`);
    }
    if (typeof config.rag.cheapSuggestModel === 'string' && config.rag.cheapSuggestModel.trim()) {
      lines.push(`cheapSuggestModel = ${tomlEscapeString(config.rag.cheapSuggestModel)}`);
    }
    lines.push('');
  }
  return `${lines.join('\n').trim()}\n`;
}

function parseTomlValue(raw: string): string | number | boolean | undefined {
  const value = raw.trim();
  if (!value) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1).replace(/\\n/g, '\n');
    }
  }
  return value;
}

function parseToml(text: string): MagicbornCliConfig {
  const config: MagicbornCliConfig = {};
  let section: '' | 'models' | 'rag' = '';
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (line === '[models]') {
      section = 'models';
      continue;
    }
    if (line === '[rag]') {
      section = 'rag';
      continue;
    }
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = parseTomlValue(line.slice(eq + 1));
    if (value === undefined) continue;
    if (!section && key === 'styleBlock' && typeof value === 'string') {
      config.styleBlock = value;
      continue;
    }
    if (section === 'models') {
      config.models = config.models ?? {};
      if (typeof value === 'string') {
        (config.models as Record<string, string>)[key] = value;
      }
      continue;
    }
    if (section === 'rag') {
      config.rag = config.rag ?? {};
      if (key === 'enabled' && typeof value === 'boolean') config.rag.enabled = value;
      if (key === 'defaultBookSlug' && typeof value === 'string') config.rag.defaultBookSlug = value;
      if (key === 'maxHits' && typeof value === 'number') config.rag.maxHits = value;
      if (key === 'useRagForBookGenerate' && typeof value === 'boolean') config.rag.useRagForBookGenerate = value;
      if (key === 'suggestModel' && typeof value === 'string') config.rag.suggestModel = value;
      if (key === 'cheapSuggestModel' && typeof value === 'string') config.rag.cheapSuggestModel = value;
    }
  }
  return config;
}

export function loadMagicbornCliConfig(): MagicbornCliConfig {
  const configPath = getConfigPath();
  const legacyPath = getLegacyJsonPath();
  if (fs.existsSync(configPath)) {
    try {
      return parseToml(fs.readFileSync(configPath, 'utf8'));
    } catch {
      return {};
    }
  }
  if (fs.existsSync(legacyPath)) {
    try {
      const raw = fs.readFileSync(legacyPath, 'utf8');
      const parsed = JSON.parse(raw) as MagicbornCliConfig;
      const cfg = parsed && typeof parsed === 'object' ? parsed : {};
      saveMagicbornCliConfig(cfg);
      return cfg;
    } catch {
      return {};
    }
  }
  return {};
}

export function saveMagicbornCliConfig(next: MagicbornCliConfig): { path: string } {
  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, toToml(next), 'utf8');
  return { path: configPath };
}

export function mergeMagicbornCliConfig(
  patch: MagicbornCliConfig,
): { path: string; config: MagicbornCliConfig } {
  const prev = loadMagicbornCliConfig();
  const next: MagicbornCliConfig = {
    ...prev,
    ...patch,
    models: {
      ...(prev.models ?? {}),
      ...(patch.models ?? {}),
    },
  };
  return { path: saveMagicbornCliConfig(next).path, config: next };
}
