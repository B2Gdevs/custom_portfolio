#!/usr/bin/env node
/**
 * Portfolio wrapper: builds `public/planning-embed/builtin-packs.json` from monorepo `.planning` + docs slice.
 * Logic lives in `scripts/lib/embed-builtin-packs-build.mjs` (forked from archived `vendor/repo-planner`).
 */
const path = require("path");
const { pathToFileURL } = require("url");

const SCRIPT_DIR = __dirname;
const PORTFOLIO_ROOT = path.join(SCRIPT_DIR, "..");
const MONOREPO_ROOT = path.join(PORTFOLIO_ROOT, "..", "..");
const OUT_FILE = path.join(PORTFOLIO_ROOT, "public", "planning-embed", "builtin-packs.json");
const DOCS_DIR = path.join(PORTFOLIO_ROOT, "content", "docs", "repo-planner");

const LIB = path.join(SCRIPT_DIR, "lib", "embed-builtin-packs-build.mjs");

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
