import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import matter from 'gray-matter';
import { extractSceneCandidatesFromMdx } from '@/lib/magicborn/extract-mdx-scenes';
import { createMagicbornCli } from '@/lib/magicborn/magicborn-cli-ui';
import { MAGICBORN_SCENE_SEEDS } from '@/lib/magicborn-prompts/scene-seeds';
import { resolvePortfolioAppRoot } from '@/lib/payload/app-root';
import { extractParseOptions } from '../generate-config';
import { exitJsonFromUnknown } from '../cli-json';
import { resolveMagicbornRepoRoot } from '../paths';

export function runBookScenesList(flagArgs: string[]): void {
  const { values } = parseArgs({
    args: flagArgs,
    options: { json: { type: 'boolean', default: false } },
    strict: true,
    allowPositionals: false,
  });
  const json = values.json === true;
  const rows = MAGICBORN_SCENE_SEEDS.map((s) => ({
    key: s.key,
    title: s.title,
    promptPreview: s.prompt.length > 120 ? `${s.prompt.slice(0, 117)}…` : s.prompt,
  }));
  if (json) {
    console.log(JSON.stringify({ ok: true, scenes: rows }, null, 2));
    process.exit(0);
  }
  const isCli = process.env.MAGICBORN_CLI === '1';
  if (isCli) {
    createMagicbornCli(true).banner('scenes · list', 'book');
    console.log('Curated scene seeds (use --seed <key> with `magicborn book generate`)');
    console.log('─'.repeat(60));
  }
  for (const r of rows) {
    console.log(`${r.key}`);
    console.log(`  ${r.title}`);
    if (isCli) {
      console.log(`  ${r.promptPreview}`);
      console.log('');
    }
  }
  if (isCli) {
    console.log('Tip: magicborn book generate --seed <key> --slug <bookSlug> [--prompt "…"]');
  }
  process.exit(0);
}

function loadMdxInputsForExtract(
  repoRoot: string,
  opts: { file?: string; slug?: string },
): { label: string; raw: string }[] {
  const appRoot = resolvePortfolioAppRoot();
  if (opts.file?.trim()) {
    const rel = opts.file.trim();
    const p = path.isAbsolute(rel) ? rel : path.join(repoRoot, rel);
    if (!existsSync(p)) {
      throw new Error(`File not found: ${p}`);
    }
    return [{ label: path.relative(repoRoot, p), raw: readFileSync(p, 'utf8') }];
  }
  if (opts.slug?.trim()) {
    const slug = opts.slug.trim();
    const dir = path.join(appRoot, 'content', 'docs', 'magicborn', 'in-world', slug);
    if (!existsSync(dir)) {
      throw new Error(
        `No folder ${dir}. Use a book slug under content/docs/magicborn/in-world/<slug>/ or --file <path>.`,
      );
    }
    const files = readdirSync(dir).filter((f) => f.endsWith('.mdx')).sort();
    if (files.length === 0) {
      throw new Error(`No .mdx files in ${dir}`);
    }
    return files.map((f) => {
      const fp = path.join(dir, f);
      return { label: path.relative(repoRoot, fp), raw: readFileSync(fp, 'utf8') };
    });
  }
  throw new Error('Pass --file <path> or --slug <book> (or a positional slug after extract).');
}

export function runBookScenesExtract(flagArgs: string[]): void {
  const { values, positionals } = parseArgs({
    args: flagArgs,
    options: extractParseOptions,
    strict: true,
    allowPositionals: true,
  });

  const json = values.json === true;
  const allHeadings = values['all-headings'] === true;
  const slugArg = (values.slug as string | undefined)?.trim() || positionals[0]?.trim();
  const fileArg = (values.file as string | undefined)?.trim();

  const isCli = process.env.MAGICBORN_CLI === '1';

  try {
    const repoRoot = resolveMagicbornRepoRoot();
    const inputs = loadMdxInputsForExtract(repoRoot, { file: fileArg, slug: slugArg });

    type BlockOut = {
      index: number;
      heading: string;
      lineStart: number;
      bodyChars: number;
      bodyPreview: string;
    };

    const fileResults: { path: string; frontmatterTitle?: string; blocks: BlockOut[] }[] = [];
    let blockTotal = 0;

    for (const input of inputs) {
      const parsed = matter(input.raw);
      const content = parsed.content;
      const title = typeof parsed.data?.title === 'string' ? parsed.data.title : undefined;
      const blocks = extractSceneCandidatesFromMdx(content, { includeAllHeadings: allHeadings });
      const outBlocks: BlockOut[] = blocks.map((b) => ({
        index: b.index,
        heading: b.heading,
        lineStart: b.lineStart,
        bodyChars: b.body.length,
        bodyPreview: b.body.length > 360 ? `${b.body.slice(0, 357)}…` : b.body,
      }));
      blockTotal += outBlocks.length;
      fileResults.push({
        path: input.label.replace(/\\/g, '/'),
        ...(title ? { frontmatterTitle: title } : {}),
        blocks: outBlocks,
      });
    }

    if (json) {
      console.log(
        JSON.stringify(
          {
            ok: true,
            phase: 'global-tooling-05-05',
            allHeadings,
            summary: { fileCount: fileResults.length, blockCount: blockTotal },
            files: fileResults,
          },
          null,
          2,
        ),
      );
      process.exit(0);
    }

    if (isCli) {
      createMagicbornCli(true).banner('scenes · extract', 'book');
    }
    console.log(`Extracted ${blockTotal} scene-like block(s) from ${fileResults.length} file(s).`);
    console.log('─'.repeat(60));
    for (const fr of fileResults) {
      console.log(`File: ${fr.path}`);
      if (fr.frontmatterTitle) {
        console.log(`  title: ${fr.frontmatterTitle}`);
      }
      for (const b of fr.blocks) {
        console.log(`  [${b.index}] L${b.lineStart} · ${b.heading}`);
        console.log(`      ${b.bodyPreview.split('\n').join('\n      ')}`);
        console.log('');
      }
    }
    if (isCli) {
      console.log('Tip: pipe JSON with --json for scripts; use `magicborn batch --style "…" --scenes "a,b"` with labels.');
    }
    process.exit(0);
  } catch (e) {
    exitJsonFromUnknown(json, e, 'extract_failed');
  }
}
