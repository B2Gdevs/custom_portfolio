/**
 * Portfolio-side magicborn entry (`pnpm magicborn` → @magicborn/cli).
 * Routing: `dispatch.ts`; handlers: `commands/*.ts` (generate, batch, style, …).
 */
import { dispatchMagicbornCli } from './dispatch';
import { loadMagicbornEnv } from './load-magicborn-env';

loadMagicbornEnv();
dispatchMagicbornCli(process.argv.slice(2)).catch((e) => {
  console.error(e);
  process.exit(1);
});
