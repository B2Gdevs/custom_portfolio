import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildLivePlanningBundle } from '@/lib/repo-planner/live-bundle';

describe('buildLivePlanningBundle', () => {
  const originalEnv = process.env;
  let tempRoot = '';

  beforeEach(() => {
    tempRoot = mkdtempSync(path.join(os.tmpdir(), 'repo-planner-bundle-'));
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

  it('builds the live cockpit bundle from the config-selected planning root without CLI spawn', () => {
    mkdirSync(path.join(tempRoot, '.planning'), { recursive: true });
    mkdirSync(path.join(tempRoot, 'workspace-a', 'planner', 'phases', '01-bootstrap'), {
      recursive: true,
    });

    writeFileSync(
      path.join(tempRoot, '.planning', 'gad-config.toml'),
      [
        '[planning]',
        'sprintSize = 5',
        '',
        '[[planning.roots]]',
        'id = "primary"',
        'path = "workspace-a"',
        'planningDir = "planner"',
      ].join('\n'),
      'utf8',
    );

    const planningDir = path.join(tempRoot, 'workspace-a', 'planner');
    writeFileSync(
      path.join(planningDir, 'STATE.xml'),
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
        '  <next-action>Implement the primary phase.</next-action>',
        '</state>',
      ].join('\n'),
      'utf8',
    );
    writeFileSync(
      path.join(planningDir, 'TASK-REGISTRY.xml'),
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<task-registry>',
        '  <phase id="01">',
        '    <task id="01-01" agent-id="agent-1" status="in-progress">',
        '      <goal>Replace the live read path.</goal>',
        '      <keywords>repo-planner,live</keywords>',
        '      <commands>',
        '        <command>pnpm run build</command>',
        '      </commands>',
        '      <depends></depends>',
        '    </task>',
        '    <task id="01-02" agent-id="" status="done">',
        '      <goal>Previous task done.</goal>',
        '      <keywords>repo-planner,done</keywords>',
        '      <commands>',
        '        <command>pnpm run lint</command>',
        '      </commands>',
        '      <depends>01-01</depends>',
        '    </task>',
        '  </phase>',
        '  <phase id="02">',
        '    <task id="02-01" agent-id="" status="planned">',
        '      <goal>Pack parity later.</goal>',
        '      <keywords>repo-planner,pack</keywords>',
        '      <commands>',
        '        <command>pnpm run build</command>',
        '      </commands>',
        '      <depends></depends>',
        '    </task>',
        '  </phase>',
        '</task-registry>',
      ].join('\n'),
      'utf8',
    );
    writeFileSync(
      path.join(planningDir, 'ROADMAP.xml'),
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<roadmap>',
        '  <phase id="01">',
        '    <title>Direct live bundle</title>',
        '    <goal>Read XML directly.</goal>',
        '    <status>active</status>',
        '    <depends></depends>',
        '    <plans></plans>',
        '  </phase>',
        '  <phase id="02">',
        '    <title>Pack parity</title>',
        '    <goal>Keep pack mode honest.</goal>',
        '    <status>planned</status>',
        '    <depends>01</depends>',
        '    <plans></plans>',
        '  </phase>',
        '</roadmap>',
      ].join('\n'),
      'utf8',
    );
    writeFileSync(
      path.join(planningDir, 'phases', '01-bootstrap', '01-bootstrap-PLAN.xml'),
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<phase-plan>',
        '  <meta>',
        '    <phase-id>01</phase-id>',
        '  </meta>',
        '  <questions>',
        '    <question id="q-1" status="open">Which fields should Live expose first?</question>',
        '    <question id="q-2" status="answered">Decision already recorded.</question>',
        '  </questions>',
        '</phase-plan>',
      ].join('\n'),
      'utf8',
    );

    const bundle = buildLivePlanningBundle();

    expect(bundle.snapshot).toMatchObject({
      currentPhase: '01',
      currentPlan: 'bootstrap',
      status: 'active',
      nextAction: 'Implement the primary phase.',
    });
    expect(bundle.openTasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: '01-01',
          status: 'in-progress',
          phase: '01',
        }),
        expect.objectContaining({
          id: '02-01',
          status: 'planned',
          phase: '02',
        }),
      ]),
    );
    expect(bundle.openQuestions).toEqual([
      expect.objectContaining({
        phaseId: '01',
        id: 'q-1',
        text: 'Which fields should Live expose first?',
        file: 'workspace-a/planner/phases/01-bootstrap/01-bootstrap-PLAN.xml',
      }),
    ]);
    expect(bundle.context.summary.phases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '01', title: 'Direct live bundle' }),
        expect.objectContaining({ id: '02', title: 'Pack parity' }),
      ]),
    );
    expect(bundle.context.planningRoots).toEqual([
      expect.objectContaining({
        id: 'primary',
        planningDir: 'workspace-a/planner',
        workspaceRoot: 'workspace-a',
      }),
    ]);
    expect(bundle.agentsWithTasks).toEqual([
      expect.objectContaining({
        agent: expect.objectContaining({ id: 'agent-1', phase: '01' }),
      }),
    ]);
    expect(bundle.workflow.reminder.deepLinkPath).toBe('AGENTS.md');
    expect(bundle.workflow.sprint.phaseIds).toEqual(['01', '02']);
    expect(bundle.workflow.recommendations[0]).toMatchObject({
      phaseId: '01',
      action: 'Implement now',
      missingTests: true,
    });
  });
});
