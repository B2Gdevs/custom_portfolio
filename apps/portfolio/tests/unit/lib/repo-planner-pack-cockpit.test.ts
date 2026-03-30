import { buildPlanningPackCockpitData } from '@/lib/repo-planner-pack-cockpit';

describe('buildPlanningPackCockpitData', () => {
  it('builds a cockpit bundle and single-point metrics from an XML pack', () => {
    const pack = {
      id: 'pack-1',
      name: 'Sample pack',
      createdAt: '2026-03-29T00:00:00.000Z',
      files: [
        {
          path: 'ROADMAP.xml',
          content: `<?xml version="1.0" encoding="UTF-8"?>
<roadmap>
  <phase id="01">
    <goal>Phase one</goal>
    <status>active</status>
    <depends></depends>
  </phase>
</roadmap>`,
        },
        {
          path: 'TASK-REGISTRY.xml',
          content: `<?xml version="1.0" encoding="UTF-8"?>
<task-registry>
  <phase id="01">
    <task id="01-01" agent-id="agent-1" status="planned">
      <goal>Ship the shell</goal>
      <keywords>ui</keywords>
      <commands><command>pnpm run build</command></commands>
      <depends></depends>
    </task>
    <task id="01-02" agent-id="agent-1" status="done">
      <goal>Wire the bundle</goal>
      <keywords>data</keywords>
      <commands><command>pnpm run test</command></commands>
      <depends></depends>
    </task>
  </phase>
</task-registry>`,
        },
        {
          path: 'STATE.xml',
          content: `<?xml version="1.0" encoding="UTF-8"?>
<state>
  <agent-registry>
    <agent id="agent-1">
      <name>Main agent</name>
      <phase>01</phase>
      <plan>repo-planner-integration-03</plan>
      <status>in-progress</status>
      <since>2026-03-29</since>
    </agent>
  </agent-registry>
  <current-phase>01</current-phase>
  <current-plan>repo-planner-integration-03</current-plan>
  <status>active</status>
  <next-action>Ship pack mode.</next-action>
  <references>
    <reference>.planning/ROADMAP.xml</reference>
  </references>
</state>`,
        },
        {
          path: 'reports/latest.md',
          content: '# Latest report\n\nEverything is green.',
        },
      ],
    };

    const result = buildPlanningPackCockpitData(pack);

    expect(result.bundle.snapshot?.currentPhase).toBe('01');
    expect(result.bundle.openTasks).toHaveLength(1);
    expect(result.bundle.context?.summary?.phases?.[0]?.title).toBe('01');
    expect(result.metrics.metrics).toHaveLength(1);
    expect(result.metrics.metrics[0]?.tasksTotal).toBe(2);
    expect(result.metrics.metrics[0]?.tasksDone).toBe(1);
    expect(result.reportMarkdown).toContain('Latest report');
  });

  it('supports markdown task registries and honest empty report output', () => {
    const pack = {
      id: 'pack-2',
      name: 'Docs pack',
      createdAt: '2026-03-29T00:00:00.000Z',
      files: [
        {
          path: 'planning/task-registry.mdx',
          content: `| Id | Status | Goal | Depends | Verify |
| --- | --- | --- | --- | --- |
| \`repo-planner-integration-03-04\` | \`planned\` | Parse the pack into the cockpit. | \`-\` | \`pnpm run build\` |`,
        },
        {
          path: 'planning/roadmap.mdx',
          content: `## Phase \`repo-planner-integration-03\`

Pack parity`,
        },
      ],
    };

    const result = buildPlanningPackCockpitData(pack);

    expect(result.bundle.openTasks?.[0]?.id).toBe('repo-planner-integration-03-04');
    expect(result.bundle.workflow?.recommendations[0]).toMatchObject({
      phaseId: 'repo-planner-integration-03',
      action: 'Implement now',
    });
    expect(result.reportMarkdown).toBe('');
  });
});
