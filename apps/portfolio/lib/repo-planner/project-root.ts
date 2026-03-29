import path from 'node:path';

export function getProjectRoot(): string {
  const raw = process.env.REPOPLANNER_PROJECT_ROOT || process.cwd();
  return path.resolve(process.cwd(), raw);
}

export function getCliPath(): string {
  const root = getProjectRoot();
  const explicit = process.env.REPOPLANNER_CLI_PATH;
  if (explicit) {
    return path.resolve(root, explicit);
  }

  return path.join(root, 'vendor', 'repo-planner', 'scripts', 'loop-cli.mjs');
}

export function getPlanningDir(): string {
  return path.join(getProjectRoot(), '.planning');
}

/** Env for `spawn` of `loop-cli.mjs` — pins project root and externalizes reports from `.planning/reports`. */
export function getRepoPlannerChildEnv(): NodeJS.ProcessEnv {
  const root = getProjectRoot();
  const raw = process.env.REPOPLANNER_REPORTS_DIR?.trim();
  const reportsDir = raw || path.join(root, '.planning-reports');
  const reportsResolved = path.isAbsolute(reportsDir) ? reportsDir : path.resolve(root, reportsDir);
  return {
    ...process.env,
    REPOPLANNER_PROJECT_ROOT: root,
    REPOPLANNER_REPORTS_DIR: reportsResolved,
  };
}
