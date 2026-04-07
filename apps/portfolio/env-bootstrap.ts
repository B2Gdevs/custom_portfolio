/**
 * Must be the **first** import in `next.config.ts`.
 *
 * ES modules evaluate all imports before the config body runs. Without this file, `withPayload`
 * and other imports could initialize Payload/Postgres before `applyMonorepoEnvFromRepoRoot()` ran,
 * so `DATABASE_URL` from the monorepo root `.env` was missing during `pnpm build` from the repo root.
 */
import path from 'path';
import { applyMonorepoEnvFromRepoRoot } from './lib/monorepo-env';

const portfolioRoot = path.resolve(__dirname);
applyMonorepoEnvFromRepoRoot({ portfolioRoot, mode: 'fillUndefinedOrEmpty' });
