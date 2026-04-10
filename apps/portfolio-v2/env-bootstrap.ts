/**
 * Must be the **first** import in `next.config.ts`.
 * Merges monorepo root `.env` / `.env.local` into `process.env` before Payload initializes.
 */
import path from 'path';
import { applyMonorepoEnvFromRepoRoot } from './lib/monorepo-env';

const appRoot = path.resolve(__dirname);
applyMonorepoEnvFromRepoRoot({ portfolioRoot: appRoot, mode: 'fillUndefinedOrEmpty' });
