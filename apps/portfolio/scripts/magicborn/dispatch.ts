import { printCompleteLines } from './complete-words';
import { runOpenAiCli } from './openai-cli';
import { runBatch } from './commands/batch';
import { runBookScenesExtract, runBookScenesList } from './commands/book-scenes';
import {
  runBooksIllustrationsScan,
  runSiteLogoList,
  runSiteLogoSetActive,
} from './commands/books-tools';
import { runAppList, runProjectList } from './commands/content-lists';
import { runGenerate } from './commands/generate';
import { runModelCommand } from './commands/model-cli';
import { runPayloadAppGenerate, runPayloadCollections } from './commands/payload';
import { runStyleCommand } from './commands/style';
import { asGenerateTarget } from './generate-config';

/** Routes `magicborn <resource> <action> …` after `loadMagicbornEnv()` (see `run.ts`). */
export async function dispatchMagicbornCli(argv: string[]): Promise<void> {
  if (argv[0] === '__complete') {
    printCompleteLines(argv[1] ?? '');
    process.exit(0);
  }

  if (argv.length === 0) {
    console.error(
      'Usage: magicborn <book|books|app|project|planning-pack|listen|batch|site|style|model|openai|chat|payload|pnpm|vendor|completion|shell-init|update> …\nFrom @magicborn/cli, an empty TTY run opens the Ink home; plain mode: magicborn --help',
    );
    process.exit(1);
  }

  const [a0, a1, a2] = argv;

  if (a0 === 'books' && a1 === 'illustrations' && a2 === 'scan') {
    await runBooksIllustrationsScan(argv.slice(3));
    return;
  }

  if (a0 === 'site' && a1 === 'logo' && a2 === 'list') {
    await runSiteLogoList(argv.slice(3));
    return;
  }

  if (a0 === 'site' && a1 === 'logo' && a2 === 'set-active') {
    await runSiteLogoSetActive(argv.slice(3));
    return;
  }

  if (a0 === 'batch') {
    await runBatch(argv.slice(1));
    return;
  }

  if (a0 === 'book' && (a1 === 'generate' || a1 === 'gen')) {
    await runGenerate('book', argv.slice(2));
    return;
  }

  if (a0 === 'book' && a1 === 'scenes' && a2 === 'list') {
    runBookScenesList(argv.slice(3));
    return;
  }
  if (a0 === 'book' && a1 === 'scenes' && a2 === 'extract') {
    runBookScenesExtract(argv.slice(3));
    return;
  }

  if (a0 === 'app' && a1 === 'list') {
    await runAppList(argv.slice(2));
    return;
  }
  if (a0 === 'app' && (a1 === 'generate' || a1 === 'gen')) {
    await runGenerate('app', argv.slice(2));
    return;
  }

  if (a0 === 'project' && a1 === 'list') {
    runProjectList(argv.slice(2));
    return;
  }
  if (a0 === 'project' && (a1 === 'generate' || a1 === 'gen')) {
    await runGenerate('project', argv.slice(2));
    return;
  }

  if (a0 === 'planning-pack' && (a1 === 'generate' || a1 === 'gen')) {
    await runGenerate('planning-pack', argv.slice(2));
    return;
  }

  if (a0 === 'listen' && (a1 === 'generate' || a1 === 'gen')) {
    await runGenerate('listen', argv.slice(2));
    return;
  }

  if (a0 === 'style') {
    runStyleCommand(argv.slice(1));
    return;
  }

  if (a0 === 'model') {
    await runModelCommand(argv.slice(1));
    return;
  }

  if (a0 === 'openai') {
    await runOpenAiCli(argv.slice(1));
    return;
  }

  if (a0 === 'payload' && a1 === 'collections') {
    await runPayloadCollections(argv.slice(2));
    return;
  }

  if (a0 === 'payload' && a1 === 'app' && (a2 === 'generate' || a2 === 'gen')) {
    await runPayloadAppGenerate(argv.slice(3));
    return;
  }

  /* Legacy: generate <target> … */
  if (a0 === 'generate') {
    const legacyTarget = asGenerateTarget(a1);
    if (!legacyTarget) {
      console.error(
        `Unknown target "${a1 ?? ''}". Use: magicborn <book|app|project|…> generate … (resource first).`,
      );
      process.exit(1);
    }
    await runGenerate(legacyTarget, argv.slice(2));
    return;
  }

  console.error(`Unknown command: ${argv.slice(0, 3).join(' ')}. See magicborn --help`);
  process.exit(1);
}
