import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const CLI_SCRIPT_PATH = fileURLToPath(
  new URL('../../../../../vendor/repo-planner/scripts/loop-cli.mjs', import.meta.url),
);

describe('repo-planner CLI workflow helpers', () => {
  const originalEnv = process.env;
  let tempRoot = '';

  beforeEach(() => {
    tempRoot = mkdtempSync(path.join(os.tmpdir(), 'repo-planner-workflow-cli-'));
    process.env = {
      ...originalEnv,
      REPOPLANNER_PROJECT_ROOT: tempRoot,
    };
    mkdirSync(path.join(tempRoot, '.planning'), { recursive: true });
    mkdirSync(path.join(tempRoot, '.planning', 'phases', '01-bootstrap'), { recursive: true });

    writeFileSync(
      path.join(tempRoot, '.planning', 'planning-config.toml'),
      ['[planning]', 'sprintSize = 5'].join('\n'),
      'utf8',
    );
    writeFileSync(
      path.join(tempRoot, '.planning', 'STATE.xml'),
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<state>',
        '  <agent-registry></agent-registry>',
        '  <current-phase>01</current-phase>',
        '  <current-plan>bootstrap</current-plan>',
        '  <status>active</status>',
        '  <next-action>Implement workflow scoring.</next-action>',
        '</state>',
      ].join('\n'),
      'utf8',
    );
    writeFileSync(
      path.join(tempRoot, '.planning', 'TASK-REGISTRY.xml'),
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<task-registry>',
        '  <phase id="01">',
        '    <task id="01-01" agent-id="agent-1" status="in-progress">',
        '      <goal>Build workflow scoring.</goal>',
        '      <keywords>workflow</keywords>',
        '      <commands><command>pnpm run build</command></commands>',
        '      <depends></depends>',
        '    </task>',
        '  </phase>',
        '  <phase id="02">',
        '    <task id="02-01" agent-id="" status="planned">',
        '      <goal>Decide question UX.</goal>',
        '      <keywords>workflow</keywords>',
        '      <commands><command>pnpm run build</command></commands>',
        '      <depends></depends>',
        '    </task>',
        '  </phase>',
        '</task-registry>',
      ].join('\n'),
      'utf8',
    );
    writeFileSync(
      path.join(tempRoot, '.planning', 'ROADMAP.xml'),
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<roadmap>',
        '  <phase id="01">',
        '    <title>Workflow scoring</title>',
        '    <goal>Recommend work.</goal>',
        '    <status>active</status>',
        '    <depends></depends>',
        '    <plans></plans>',
        '  </phase>',
        '  <phase id="02">',
        '    <title>Question UX</title>',
        '    <goal>Discuss the remaining entropy.</goal>',
        '    <status>planned</status>',
        '    <depends>01</depends>',
        '    <plans></plans>',
        '  </phase>',
        '</roadmap>',
      ].join('\n'),
      'utf8',
    );
    writeFileSync(
      path.join(tempRoot, '.planning', 'phases', '01-bootstrap', '01-bootstrap-PLAN.xml'),
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<phase-plan>',
        '  <meta><phase-id>02</phase-id></meta>',
        '  <questions>',
        '    <question id="q-1" status="open">How do we present score?</question>',
        '    <question id="q-2" status="open">How do we present action?</question>',
        '    <question id="q-3" status="answered">Decision recorded.</question>',
        '  </questions>',
        '</phase-plan>',
      ].join('\n'),
      'utf8',
    );
    writeFileSync(path.join(tempRoot, 'AGENTS.md'), '# Root agents\n', 'utf8');
  });

  afterEach(() => {
    rmSync(tempRoot, { recursive: true, force: true });
    process.env = originalEnv;
  });

  it('prints workflow kickoff data and blocks invalid done updates', () => {
    const kickoffTextResult = spawnSync(
      process.execPath,
      [CLI_SCRIPT_PATH, 'workflow', 'kickoff', '02'],
      {
        cwd: process.cwd(),
        env: process.env,
        encoding: 'utf8',
      },
    );

    expect(kickoffTextResult.status).toBe(0);
    expect(kickoffTextResult.stdout).toContain('## Kickoff: `02`');
    expect(kickoffTextResult.stdout).toContain('| `definition of done` |');

    const kickoffResult = spawnSync(
      process.execPath,
      [CLI_SCRIPT_PATH, 'workflow', 'kickoff', '02', '--json'],
      {
        cwd: process.cwd(),
        env: process.env,
        encoding: 'utf8',
      },
    );

    expect(kickoffResult.status).toBe(0);
    const kickoffPayload = JSON.parse(kickoffResult.stdout);
    expect(kickoffPayload.kickoff.required).toBe(true);
    expect(kickoffPayload.kickoff.reasons).toContain('Open questions still need discussion');

    const phaseUpdateResult = spawnSync(
      process.execPath,
      [CLI_SCRIPT_PATH, 'phase-update', '01', 'done'],
      {
        cwd: process.cwd(),
        env: process.env,
        encoding: 'utf8',
      },
    );

    expect(phaseUpdateResult.status).toBe(1);
    expect(phaseUpdateResult.stderr).toContain('Refusing to mark 01 done');
    expect(phaseUpdateResult.stderr).toContain('Tests are missing from the verification path');
  });
});
