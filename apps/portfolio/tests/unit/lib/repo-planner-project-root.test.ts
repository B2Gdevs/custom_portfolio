import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getPlanningDir,
  getReportsDir,
  resolvePlanningRoots,
} from '@/lib/repo-planner/project-root';

describe('repo planner project-root helpers', () => {
  const originalEnv = process.env;
  let tempRoot = '';

  beforeEach(() => {
    tempRoot = mkdtempSync(path.join(os.tmpdir(), 'repo-planner-root-'));
    process.env = {
      ...originalEnv,
      REPOPLANNER_PROJECT_ROOT: tempRoot,
    };
    delete process.env.REPOPLANNER_REPORTS_DIR;
  });

  afterEach(() => {
    rmSync(tempRoot, { recursive: true, force: true });
    process.env = originalEnv;
  });

  it('falls back to repo-root .planning and .planning-reports when config does not declare roots', () => {
    const roots = resolvePlanningRoots();

    expect(roots).toHaveLength(1);
    expect(roots[0]).toMatchObject({
      id: 'global',
      source: 'default',
      planningDir: path.join(tempRoot, '.planning'),
    });
    expect(getPlanningDir()).toBe(path.join(tempRoot, '.planning'));
    expect(getReportsDir()).toBe(path.join(tempRoot, '.planning-reports'));
  });

  it('uses gad-config roots and reportsDir as the shared live resolver contract', () => {
    mkdirSync(path.join(tempRoot, '.planning'), { recursive: true });
    mkdirSync(path.join(tempRoot, 'workspace-a', 'planner'), { recursive: true });
    mkdirSync(path.join(tempRoot, 'workspace-b', 'planning'), { recursive: true });
    writeFileSync(
      path.join(tempRoot, '.planning', 'gad-config.toml'),
      [
        '[planning]',
        'reportsDir = "logs/planning"',
        '',
        '[[planning.roots]]',
        'id = "primary"',
        'path = "workspace-a"',
        'planningDir = "planner"',
        '',
        '[[planning.roots]]',
        'id = "docs"',
        'path = "workspace-b"',
        'planningDir = "planning"',
      ].join('\n'),
      'utf8',
    );

    const roots = resolvePlanningRoots();

    expect(
      roots.map((root) => ({
        id: root.id,
        planningDir: root.planningDir,
      })),
    ).toEqual([
      { id: 'primary', planningDir: path.join(tempRoot, 'workspace-a', 'planner') },
      { id: 'docs', planningDir: path.join(tempRoot, 'workspace-b', 'planning') },
    ]);
    expect(getPlanningDir()).toBe(path.join(tempRoot, 'workspace-a', 'planner'));
    expect(getReportsDir()).toBe(path.join(tempRoot, 'logs', 'planning'));
  });

  it('merges [[planning.sections]] as monorepo roots (path implied .)', () => {
    mkdirSync(path.join(tempRoot, '.planning'), { recursive: true });
    writeFileSync(
      path.join(tempRoot, '.planning', 'gad-config.toml'),
      [
        '[planning]',
        '',
        '[[planning.sections]]',
        'id = "global"',
        'planningDir = ".planning"',
        '',
        '[[planning.roots]]',
        'id = "vendor-a"',
        'path = "vendor/a"',
        'planningDir = ".planning"',
        'discover = false',
      ].join('\n'),
      'utf8',
    );

    const roots = resolvePlanningRoots();

    expect(roots.map((r) => r.id)).toEqual(['vendor-a', 'global']);
    const globalRoot = roots.find((r) => r.id === 'global');
    expect(globalRoot?.workspaceRoot).toBe(tempRoot);
    expect(globalRoot?.planningDir).toBe(path.join(tempRoot, '.planning'));
  });
});
