export type MinimalTemplateFile = {
  path: string;
  content: string;
};

export function getMinimalPlanningTemplateFiles(): MinimalTemplateFile[] {
  const requirementsMd = `# Requirements (monorepo)

This is the repo-root requirements stub for a minimal **GAD-shaped** \`.planning/\` bootstrap (XML + loop files).

- Keep narrative requirements at the repository root.
- Keep machine-readable planning files under \`.planning/\`.
- Use roadmap, state, task registry, and decisions as the living loop.
`;

  const planningAgentsMd = `# .planning/AGENTS.md -- root planning section (XML)

Read the repository root \`AGENTS.md\` first.

## What this folder is

\`.planning/\` is the machine-readable planning section:

- \`STATE.xml\`
- \`TASK-REGISTRY.xml\`
- \`ROADMAP.xml\`
- \`DECISIONS.xml\`
- \`ERRORS-AND-ATTEMPTS.xml\`
- \`REQUIREMENTS.xml\`

Keep narrative requirements at the repository root and section planning in your docs tree.
`;

  const roadmapXml = `<?xml version="1.0" encoding="UTF-8"?>
<roadmap>
  <phase id="01">
    <goal>Bootstrap the planning loop and align roadmap, state, task registry, and requirements.</goal>
    <status>active</status>
    <depends></depends>
  </phase>
  <doc-flow>
    <doc name="REQUIREMENTS.md">Narrative requirements at the repository root.</doc>
    <doc name=".planning/ROADMAP.xml">Phase timeline.</doc>
    <doc name=".planning/TASK-REGISTRY.xml">Task graph and status.</doc>
    <doc name=".planning/AGENTS.md">Planning playbook for agents.</doc>
  </doc-flow>
</roadmap>
`;

  const stateXml = `<?xml version="1.0" encoding="UTF-8"?>
<state>
  <agent-registry />
  <current-phase>01</current-phase>
  <current-plan>bootstrap</current-plan>
  <status>active</status>
  <next-action>Edit REQUIREMENTS.md and the XML planning files, then run planning snapshot.</next-action>
  <references>
    <reference>REQUIREMENTS.md</reference>
    <reference>.planning/AGENTS.md</reference>
    <reference>.planning/ROADMAP.xml</reference>
    <reference>.planning/TASK-REGISTRY.xml</reference>
    <reference>.planning/DECISIONS.xml</reference>
  </references>
  <agent-id-policy>
    <format>agent-YYYYMMDD-xxxx</format>
    <rule>Register a unique id before claiming tasks if your workflow uses task updates.</rule>
    <generator>planning new-agent-id</generator>
  </agent-id-policy>
</state>
`;

  const taskRegistryXml = `<?xml version="1.0" encoding="UTF-8"?>
<task-registry>
  <phase id="01">
    <task id="01-01" agent-id="" status="planned">
      <goal>Refine requirements, roadmap, and next actions for the first real execution phase.</goal>
      <keywords>bootstrap,requirements,roadmap</keywords>
      <commands>
        <command>pnpm run lint</command>
      </commands>
      <depends></depends>
    </task>
  </phase>
</task-registry>
`;

  const decisionsXml = `<?xml version="1.0" encoding="UTF-8"?>
<decisions>
</decisions>
`;

  const errorsXml = `<?xml version="1.0" encoding="UTF-8"?>
<errors-and-attempts />
`;

  const requirementsXml = `<?xml version="1.0" encoding="UTF-8"?>
<planning-references>
  <doc>
    <path>REQUIREMENTS.md</path>
    <content><![CDATA[
# Requirements (stub)

Edit REQUIREMENTS.md at the repository root. This XML file is a bootstrap pointer for tools that read REQUIREMENTS.xml.
]]></content>
  </doc>
</planning-references>
`;

  const configToml = `[planning]
sprintSize = 5
currentProfile = "human"
conventionsPaths = ["AGENTS.md", "REQUIREMENTS.md", ".planning/AGENTS.md"]

[profiles.human]
description = "Default human view."

[profiles.agent]
description = "Agent perspective; defaultJson = true."
defaultJson = true
`;

  return [
    { path: "REQUIREMENTS.md", content: requirementsMd },
    { path: ".planning/AGENTS.md", content: planningAgentsMd },
    { path: ".planning/gad-config.toml", content: configToml },
    { path: ".planning/STATE.xml", content: stateXml },
    { path: ".planning/TASK-REGISTRY.xml", content: taskRegistryXml },
    { path: ".planning/ROADMAP.xml", content: roadmapXml },
    { path: ".planning/DECISIONS.xml", content: decisionsXml },
    { path: ".planning/ERRORS-AND-ATTEMPTS.xml", content: errorsXml },
    { path: ".planning/REQUIREMENTS.xml", content: requirementsXml },
  ];
}
