#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildRepub } from './index.js';
import { runRead } from './read.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
const sub = argv[0];

function help(): void {
  console.log(`repub - Build and read RichEPub (.repub) and EPUB

Usage:
  repub build [project-dir]     Build .repub from Vite project (default: cwd)
  repub read <file.repub>       Serve reader and open in browser
  repub epub <folder> [--output out.epub]  Pack folder of .md/.mdx into EPUB
  repub pack <folder> [--output out.repub] Pack folder of .md/.mdx into .repub

Options:
  --skip-install   (build) Skip npm install before build
  --skip-build     (build) Skip Vite build; use existing dist/
  --output <path>  (epub, pack) Output file path
  --help, -h       Show this help
  --version, -v    Show version
`);
}

function version(): void {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version: string };
  console.log(pkg.version);
}

async function main(): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    help();
    return;
  }
  if (argv.includes('--version') || argv.includes('-v')) {
    version();
    return;
  }

  if (sub === 'build') {
    const projectDir = argv[1] ? path.resolve(argv[1]) : process.cwd();
    const skipInstall = argv.includes('--skip-install');
    const skipBuild = argv.includes('--skip-build');
    const out = await buildRepub({ projectDir, skipInstall, skipBuild });
    console.log('Built:', out);
    return;
  }

  if (sub === 'read') {
    const fileArg = argv[1];
    if (!fileArg) {
      console.error('repub read requires <file.repub>');
      process.exit(1);
    }
    const repubPath = path.resolve(fileArg);
    await runRead(repubPath);
    return;
  }

  if (sub === 'epub') {
    const folderArg = argv[1];
    if (!folderArg) {
      console.error('repub epub requires <folder>');
      process.exit(1);
    }
    const folder = path.resolve(folderArg);
    const outIdx = argv.indexOf('--output');
    const outputPath = outIdx >= 0 && argv[outIdx + 1] ? path.resolve(argv[outIdx + 1]) : path.join(folder, 'book.epub');
    const { runEpub } = await import('./epub.js');
    await runEpub(folder, outputPath);
    return;
  }

  if (sub === 'pack') {
    const folderArg = argv[1];
    if (!folderArg) {
      console.error('repub pack requires <folder>');
      process.exit(1);
    }
    const folder = path.resolve(folderArg);
    const outIdx = argv.indexOf('--output');
    const outputPath = outIdx >= 0 && argv[outIdx + 1] ? path.resolve(argv[outIdx + 1]) : path.join(folder, 'book.repub');
    const { runPack } = await import('./pack.js');
    await runPack(folder, outputPath);
    return;
  }

  // Legacy: no subcommand -> treat first arg as project dir for build
  const projectDir = argv[0] ? path.resolve(argv[0]) : process.cwd();
  const skipInstall = argv.includes('--skip-install');
  const skipBuild = argv.includes('--skip-build');
  const out = await buildRepub({ projectDir, skipInstall, skipBuild });
  console.log('Built:', out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
