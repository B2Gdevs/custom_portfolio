import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const CLI_SCRIPT_PATH = fileURLToPath(
  new URL('../../../../../vendor/repo-planner/scripts/loop-cli.mjs', import.meta.url),
);

describe('repo-planner CLI snapshot', () => {
  const originalEnv = process.env;
  let tempRoot = '';

  beforeEach(() => {
    tempRoot = mkdtempSync(path.join(os.tmpdir(), 'repo-planner-cli-'));
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
        '  <agent-registry>',
        '    <agent id="agent-1">',
        '      <name>Planner</name>',
        '      <phase>01</phase>',
        '      <plan>bootstrap</plan>',
        '      <status>in-progress</status>',
        '      <since>2026-03-29</since>',
        '    </agent>',
        '  </agent-registry>',
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

  it('prints workflow reminder and ranked recommendations in snapshot output', () => {
    const result = spawnSync(
      process.execPath,
      [CLI_SCRIPT_PATH, 'snapshot'],
      {
        cwd: process.cwd(),
        env: process.env,
        encoding: 'utf8',
      },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('WORKFLOW');
    expect(result.stdout).toContain('Workflow reminder (AGENTS.md)');
    expect(result.stdout).toContain('RECOMMENDED');
    expect(result.stdout).toContain('action=Implement now');
    expect(result.stdout).toContain('action=Discuss first');
  });
});
