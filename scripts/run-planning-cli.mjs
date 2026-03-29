#!/usr/bin/env node
/**
 * Forwards argv to RepoPlanner loop-cli.mjs.
 * Defaults REPOPLANNER_REPORTS_DIR to `.planning-reports/` so `.planning/` stays free of reports/usage.jsonl.
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
const result = spawnSync(process.execPath, [cli, ...forwardedArgv], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
