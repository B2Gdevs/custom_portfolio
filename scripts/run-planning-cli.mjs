#!/usr/bin/env node
/**
 * Back-compat shim — forwards to legacy RepoPlanner CLI.
 * @deprecated Use `pnpm gad` or `scripts/run-legacy-repo-planner-cli.mjs` explicitly.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const legacy = path.resolve(__dirname, "run-legacy-repo-planner-cli.mjs");
const result = spawnSync(process.execPath, [legacy, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});
process.exit(result.status ?? 1);
