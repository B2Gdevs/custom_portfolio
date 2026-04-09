import { existsSync, readFileSync, readdirSync, type Dirent } from 'node:fs';
import path from 'node:path';
import TOML from '@iarna/toml';

const DEFAULT_PLANNING_DIR_NAME = '.planning';
const DEFAULT_REPORTS_DIR = '.planning-reports';
const DISCOVERY_IGNORED_DIRS = new Set([
  '.git',
  '.next',
  '.turbo',
  '.vscode',
  '.idea',
  'node_modules',
  'coverage',
  'dist',
  'vendor',
]);

type RawPlanningRoot = {
  id?: unknown;
  name?: unknown;
  path?: unknown;
  root?: unknown;
  workspaceRoot?: unknown;
  planningDir?: unknown;
  planningDirName?: unknown;
  discover?: unknown;
  discoverDescendants?: unknown;
};

/** Monorepo-wide root: `path` is implied `.` (see [[planning.sections]] in gad-config.toml). */
type RawPlanningSection = {
  id?: unknown;
  planningDir?: unknown;
  planning_dir?: unknown;
  discover?: unknown;
};

type RawPlanningConfig = {
  planning?: {
    roots?: RawPlanningRoot[];
    sections?: RawPlanningSection[];
    reportsDir?: unknown;
    sprintSize?: unknown;
    currentProfile?: unknown;
    conventionsPaths?: unknown;
  };
  profiles?: Record<string, unknown>;
};

export type ResolvedPlanningRoot = {
  id: string;
  source: 'config' | 'default';
  workspaceRoot: string;
  planningDirName: string;
  planningDir: string;
  discover: boolean;
  exists: boolean;
};

function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function normalizePlanningDir(workspaceRoot: string, rawPlanningDir: string | null) {
  const planningDir = rawPlanningDir ?? DEFAULT_PLANNING_DIR_NAME;
  if (path.isAbsolute(planningDir)) {
    return {
      planningDir,
      planningDirName: path.basename(planningDir) || DEFAULT_PLANNING_DIR_NAME,
    };
  }

  return {
    planningDir: path.resolve(workspaceRoot, planningDir),
    planningDirName: path.basename(planningDir) || DEFAULT_PLANNING_DIR_NAME,
  };
}

/** GAD config (canonical) or legacy planning-config.toml inside `.planning/`. */
function resolveGadConfigPath(root: string): string | null {
  const gad = path.join(root, DEFAULT_PLANNING_DIR_NAME, 'gad-config.toml');
  const legacy = path.join(root, DEFAULT_PLANNING_DIR_NAME, 'planning-config.toml');
  if (existsSync(gad)) return gad;
  if (existsSync(legacy)) return legacy;
  return null;
}

function mergePlanningSections(
  roots: RawPlanningRoot[],
  sections: RawPlanningSection[] | undefined,
): RawPlanningRoot[] {
  const seen = new Set(
    roots
      .map((r) => asNonEmptyString(r.id) ?? asNonEmptyString(r.name) ?? '')
      .filter(Boolean),
  );
  const out: RawPlanningRoot[] = [...roots];
  for (const s of sections ?? []) {
    const id = asNonEmptyString(s.id) ?? 'global';
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      path: '.',
      planningDir: asNonEmptyString(s.planningDir) ?? asNonEmptyString(s.planning_dir) ?? '.planning',
      discover: asBoolean(s.discover),
    });
  }
  return out;
}

function readRepoPlannerConfigInternal(root: string): RawPlanningConfig {
  const configPath = resolveGadConfigPath(root);
  if (!configPath) {
    return {};
  }

  try {
    return TOML.parse(readFileSync(configPath, 'utf8')) as unknown as RawPlanningConfig;
  } catch {
    return {};
  }
}

function discoverPlanningRoots(
  projectRoot: string,
  workspaceRoot: string,
  planningDirName: string,
  baseId: string,
): ResolvedPlanningRoot[] {
  const discovered: ResolvedPlanningRoot[] = [];
  const seen = new Set<string>();

  const walk = (dirPath: string) => {
    let entries: Dirent[];
    try {
      entries = readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (DISCOVERY_IGNORED_DIRS.has(entry.name)) continue;

      const absolute = path.join(dirPath, entry.name);
      if (entry.name === planningDirName) {
        if (seen.has(absolute)) continue;
        seen.add(absolute);
        const discoveredWorkspaceRoot = path.dirname(absolute);
        const relativeWorkspaceRoot = path.relative(projectRoot, discoveredWorkspaceRoot).replace(/\\/g, '/');
        discovered.push({
          id: relativeWorkspaceRoot ? `${baseId}:${relativeWorkspaceRoot}` : baseId,
          source: 'config',
          workspaceRoot: discoveredWorkspaceRoot,
          planningDirName,
          planningDir: absolute,
          discover: true,
          exists: true,
        });
        continue;
      }

      walk(absolute);
    }
  };

  walk(workspaceRoot);
  return discovered;
}

export function getProjectRoot(): string {
  const raw = process.env.REPOPLANNER_PROJECT_ROOT || process.cwd();
  return path.resolve(process.cwd(), raw);
}

export function getRepoPlannerConfigPath(): string {
  const root = getProjectRoot();
  const resolved = resolveGadConfigPath(root);
  return resolved ?? path.join(root, DEFAULT_PLANNING_DIR_NAME, 'gad-config.toml');
}

export function readRepoPlannerConfig(): RawPlanningConfig {
  return readRepoPlannerConfigInternal(getProjectRoot());
}

export function resolvePlanningRoots(): ResolvedPlanningRoot[] {
  const projectRoot = getProjectRoot();
  const parsed = readRepoPlannerConfigInternal(projectRoot);
  const roots = mergePlanningSections(
    Array.isArray(parsed.planning?.roots) ? parsed.planning.roots : [],
    Array.isArray(parsed.planning?.sections) ? parsed.planning.sections : undefined,
  );

  if (!roots.length) {
    const planningDir = path.join(projectRoot, DEFAULT_PLANNING_DIR_NAME);
    return [
      {
        id: 'global',
        source: 'default',
        workspaceRoot: projectRoot,
        planningDirName: DEFAULT_PLANNING_DIR_NAME,
        planningDir,
        discover: false,
        exists: existsSync(planningDir),
      },
    ];
  }

  const resolved: ResolvedPlanningRoot[] = [];
  const seen = new Set<string>();

  for (const [index, rawRoot] of roots.entries()) {
    const workspaceRootRaw =
      asNonEmptyString(rawRoot.path) ??
      asNonEmptyString(rawRoot.root) ??
      asNonEmptyString(rawRoot.workspaceRoot) ??
      '.';
    const workspaceRoot = path.resolve(projectRoot, workspaceRootRaw);
    const { planningDir, planningDirName } = normalizePlanningDir(
      workspaceRoot,
      asNonEmptyString(rawRoot.planningDir) ?? asNonEmptyString(rawRoot.planningDirName),
    );
    const discover = asBoolean(rawRoot.discover) || asBoolean(rawRoot.discoverDescendants);
    const id =
      asNonEmptyString(rawRoot.id) ??
      asNonEmptyString(rawRoot.name) ??
      `root-${index + 1}`;

    const addRoot = (candidate: ResolvedPlanningRoot) => {
      if (seen.has(candidate.planningDir)) return;
      seen.add(candidate.planningDir);
      resolved.push(candidate);
    };

    addRoot({
      id,
      source: 'config',
      workspaceRoot,
      planningDirName,
      planningDir,
      discover,
      exists: existsSync(planningDir),
    });

    if (discover) {
      for (const discoveredRoot of discoverPlanningRoots(projectRoot, workspaceRoot, planningDirName, id)) {
        addRoot(discoveredRoot);
      }
    }
  }

  return resolved.length
    ? resolved
    : [
        {
          id: 'global',
          source: 'default',
          workspaceRoot: projectRoot,
          planningDirName: DEFAULT_PLANNING_DIR_NAME,
          planningDir: path.join(projectRoot, DEFAULT_PLANNING_DIR_NAME),
          discover: false,
          exists: existsSync(path.join(projectRoot, DEFAULT_PLANNING_DIR_NAME)),
        },
      ];
}

export function getPrimaryPlanningRoot(): ResolvedPlanningRoot {
  return resolvePlanningRoots()[0] ?? {
    id: 'global',
    source: 'default',
    workspaceRoot: getProjectRoot(),
    planningDirName: DEFAULT_PLANNING_DIR_NAME,
    planningDir: path.join(getProjectRoot(), DEFAULT_PLANNING_DIR_NAME),
    discover: false,
    exists: existsSync(path.join(getProjectRoot(), DEFAULT_PLANNING_DIR_NAME)),
  };
}

export function getPlanningDir(): string {
  return getPrimaryPlanningRoot().planningDir;
}

export function getReportsDir(): string {
  const root = getProjectRoot();
  const envValue = process.env.REPOPLANNER_REPORTS_DIR?.trim();
  if (envValue) {
    return path.isAbsolute(envValue) ? envValue : path.resolve(root, envValue);
  }

  const configValue = asNonEmptyString(readRepoPlannerConfigInternal(root).planning?.reportsDir);
  if (configValue) {
    return path.isAbsolute(configValue) ? configValue : path.resolve(root, configValue);
  }

  return path.join(root, DEFAULT_REPORTS_DIR);
}

