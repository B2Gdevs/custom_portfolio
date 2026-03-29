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

const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
