#!/usr/bin/env node
/**
 * @deprecated Legacy RepoPlanner `loop-cli.mjs` entry. Do not extend.
 * Replace with `gad` / `pnpm gad` / `pnpm planning:*` (GAD-backed) as work lands.
 * Remaining uses: init templates, pack embed-build, report viewer — see
 * `.planning/REPOPLANNER-TO-GAD-MIGRATION-GAPS.md`.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cli = path.resolve(__dirname, "../vendor/repo-planner/scripts/loop-cli.mjs");

if (!process.env.REPOPLANNER_REPORTS_DIR?.trim()) {
  process.env.REPOPLANNER_REPORTS_DIR = ".planning-reports";
}

const forwardedArgv = process.argv.slice(2).filter((a) => a !== "--");
console.error(
  "[deprecated] RepoPlanner loop-cli — migrating to GAD. Prefer: pnpm gad -- <cmd> | pnpm planning:snapshot\n",
);

const result = spawnSync(process.execPath, [cli, ...forwardedArgv], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
