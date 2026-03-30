#!/usr/bin/env node
/**
 * Fallback JSON when an EPUB has no manifest / planning appendix (legacy builds) or extraction fails.
 * Primary path: planning pack from loaded EPUB (`META-INF/portfolio-planning-pack.json` + extractor).
 * Output: public/planning-embed/book-packs/<slug>.json — pack id `book-<slug>-planning`.
 */
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

const SCRIPT_DIR = __dirname;
const PORTFOLIO_ROOT = path.join(SCRIPT_DIR, "..");
const LIB = path.join(PORTFOLIO_ROOT, "..", "..", "vendor", "repo-planner", "scripts", "lib", "embed-builtin-packs-build.mjs");

const BOOKS_PLANNING_DIR = path.join(PORTFOLIO_ROOT, "content", "docs", "books", "planning");
const OUT_DIR = path.join(PORTFOLIO_ROOT, "public", "planning-embed", "book-packs");

/** Slugs that get a fallback JSON slice (shared books planning tree today). */
const SLUGS = ["mordreds_tale", "mordreds_legacy", "magicborn_rune_path"];

const BOOK_STREAM_SLUGS = ["magicborn-rune-path", "mordreds-legacy", "mordreds-tale"];

async function main() {
  const mod = await import(pathToFileURL(LIB).href);
  const payload = mod.buildEmbedBuiltinPacksPayload({
    docsDir: BOOKS_PLANNING_DIR,
    docsPathPrefix: "docs/books/planning",
  });

  const docsPack = payload.packs.find((p) => p.id === "rp-builtin-docs");
  if (!docsPack || !docsPack.files?.length) {
    console.warn("[build-book-planning-embed-pack] No docs pack produced; check books planning dir.");
    process.exit(1);
  }

  const streamFiles = [];
  for (const stream of BOOK_STREAM_SLUGS) {
    const streamDir = path.join(
      PORTFOLIO_ROOT,
      "content",
      "docs",
      "books",
      stream,
      "planning",
    );
    const extra = mod.buildEmbedBuiltinPacksPayload({
      docsDir: streamDir,
      docsPathPrefix: `docs/books/${stream}/planning`,
    });
    const p = extra.packs.find((x) => x.id === "rp-builtin-docs");
    if (p?.files?.length) streamFiles.push(...p.files);
  }
  docsPack.files = [...docsPack.files, ...streamFiles].sort((a, b) =>
    a.path.localeCompare(b.path),
  );

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const slug of SLUGS) {
    const packId = `book-${slug}-planning`;
    const single = {
      v: 1,
      generatedAt: new Date().toISOString(),
      packs: [
        {
          id: packId,
          label: "Books — planning docs",
          description: "Fallback: books section planning MDX (read-only in cockpit). Prefer EPUB-embedded pack.",
          files: docsPack.files,
        },
      ],
    };
    const outFile = path.join(OUT_DIR, `${slug}.json`);
    fs.writeFileSync(outFile, JSON.stringify(single, null, 2), "utf8");
    console.log(`[build-book-planning-embed-pack] ${slug} -> ${path.relative(PORTFOLIO_ROOT, outFile)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
