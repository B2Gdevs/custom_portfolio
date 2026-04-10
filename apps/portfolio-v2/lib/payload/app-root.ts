import fs from 'node:fs';
import path from 'node:path';

export function resolvePortfolioAppRoot() {
  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, 'payload.config.ts'))) {
    return cwd;
  }

  return path.join(cwd, 'apps', 'portfolio');
}

export function resolvePortfolioAppPath(...segments: string[]) {
  return path.join(resolvePortfolioAppRoot(), ...segments);
}
