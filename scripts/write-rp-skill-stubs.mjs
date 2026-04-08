/**
 * Regenerate skills/rp-* and .claude/skills/rp-* SKILL.md as thin pointers to GAD.
 * Run: node scripts/write-rp-skill-stubs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/** [legacyFolder, canonical SKILL path under vendor/get-anything-done/skills/, name from frontmatter, one-line description] */
const MAP = [
  ["rp-add-todo", "add-todo/SKILL.md", "gad:add-todo", "Capture a follow-up into planning todos."],
  ["rp-check-todos", "check-todos/SKILL.md", "gad:check-todos", "Surface the best next action from planning state."],
  ["rp-debug", "debug/SKILL.md", "gad:debug", "Systematic debugging with a persistent session file."],
  ["rp-execute-phase", "execute-phase/SKILL.md", "gad:execute-phase", "Execute a planned phase with atomic commits."],
  ["rp-map-codebase", "map-codebase/SKILL.md", "gad:map-codebase", "Map an existing codebase to planning docs."],
  [
    "rp-milestone",
    "milestone/SKILL.md",
    "gad:milestone",
    "Full milestone lifecycle (audit / close / new). README also lists split skills: audit-milestone, new-milestone, complete-milestone.",
  ],
  ["rp-new-project", "new-project/SKILL.md", "gad:new-project", "Bootstrap a new project with GAD planning structure."],
  ["rp-plan-phase", "plan-phase/SKILL.md", "gad:plan-phase", "Plan a phase (KICKOFF + PLAN)."],
  ["rp-quick", "quick/SKILL.md", "gad:quick", "Small ad-hoc task with planning guarantees."],
  ["rp-session", "session/SKILL.md", "gad:session", "Session handoff; pair with `gad session` / `gad context` CLI."],
  [
    "rp-verify-work",
    "verify-phase/SKILL.md",
    "gad:verify-phase",
    "Verify a phase met its definition of done (legacy name was rp-verify-work).",
  ],
  ["rp-manuscript", "manuscript/SKILL.md", "gad:manuscript", "Fiction / manuscript planning loop."],
];

function stubBody(legacy, relSkill, name, desc) {
  const rel = `../../vendor/get-anything-done/skills/${relSkill}`;
  return `---
name: ${name}
description: ${desc} Deprecated RepoPlanner alias — canonical methodology is under get-anything-done/skills/.
---

# ${legacy} → GAD (deprecated stub)

**Do not extend this file.** RepoPlanner \`rp-*\` skill copies are retired in favor of **GAD** skills in \`vendor/get-anything-done/skills/\`.

**Canonical skill:** \`${rel}\`

**CLI:** \`node vendor/get-anything-done/bin/gad.cjs snapshot --projectid <id>\` — see \`vendor/get-anything-done/AGENTS.md\`.

**Migration table:** \`vendor/get-anything-done/skills/README.md\` (section **Migration map — rp-* → gad:***).
`;
}

for (const [legacy, relSkill, name, desc] of MAP) {
  const md = stubBody(legacy, relSkill, name, desc);
  for (const base of [path.join(root, "skills", legacy), path.join(root, ".claude", "skills", legacy)]) {
    const f = path.join(base, "SKILL.md");
    if (fs.existsSync(path.dirname(f))) {
      fs.writeFileSync(f, md, "utf8");
      console.log("wrote", f);
    } else {
      console.warn("skip missing dir", base);
    }
  }
}
