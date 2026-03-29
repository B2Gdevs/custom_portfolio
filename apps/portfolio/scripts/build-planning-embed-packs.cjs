#!/usr/bin/env node
/**
 * Portfolio wrapper: same output as `pnpm planning pack embed-build` with paths fixed for this app.
 * @see vendor/repo-planner/scripts/lib/embed-builtin-packs-build.mjs
 */
const path = require("path");
const { pathToFileURL } = require("url");

const SCRIPT_DIR = __dirname;
const PORTFOLIO_ROOT = path.join(SCRIPT_DIR, "..");
const MONOREPO_ROOT = path.join(PORTFOLIO_ROOT, "..", "..");
const OUT_FILE = path.join(PORTFOLIO_ROOT, "public", "planning-embed", "builtin-packs.json");
const DOCS_DIR = path.join(PORTFOLIO_ROOT, "content", "docs", "repo-planner");

const LIB = path.join(MONOREPO_ROOT, "vendor", "repo-planner", "scripts", "lib", "embed-builtin-packs-build.mjs");

async function main() {
  const mod = await import(pathToFileURL(LIB).href);
  const payload = mod.runPlanningEmbedBuildSync({
    projectRoot: MONOREPO_ROOT,
    outFile: OUT_FILE,
    docsDir: DOCS_DIR,
  });
  console.log(mod.formatEmbedBuildLogLine(MONOREPO_ROOT, OUT_FILE, payload));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
