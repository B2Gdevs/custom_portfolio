import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export type VendorAddOptions = {
  repoRoot: string;
  url: string;
  name?: string;
  apply: boolean;
};

function parseGithubRepo(urlRaw: string): { cloneUrl: string; owner: string; repo: string } {
  const trimmed = urlRaw.trim();
  let cloneUrl = trimmed;
  if (trimmed.startsWith('git@github.com:')) {
    const rest = trimmed.slice('git@github.com:'.length).replace(/\.git$/, '');
    const [owner, repo] = rest.split('/');
    if (!owner || !repo) {
      throw new Error(`Could not parse git@github.com URL: ${urlRaw}`);
    }
    return { cloneUrl: trimmed, owner, repo };
  }
  try {
    const u = new URL(trimmed);
    if (u.hostname !== 'github.com' && u.hostname !== 'www.github.com') {
      throw new Error(`Only github.com URLs are supported for vendor add (got ${u.hostname}).`);
    }
    const parts = u.pathname.replace(/^\/+/, '').split('/').filter(Boolean);
    const owner = parts[0];
    const repo = parts[1]?.replace(/\.git$/, '');
    if (!owner || !repo) {
      throw new Error(`Could not parse GitHub owner/repo from ${urlRaw}`);
    }
    if (!trimmed.endsWith('.git')) {
      cloneUrl = `https://github.com/${owner}/${repo}.git`;
    }
    return { cloneUrl, owner, repo };
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(`Invalid URL: ${urlRaw}`);
    }
    throw e;
  }
}

function sanitizeVendorDir(repo: string): string {
  return repo.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/^-+|-+$/g, '') || 'vendor-module';
}

function ensureWorkspaceEntry(repoRoot: string, relPath: string): { changed: boolean; content: string } {
  const wsPath = path.join(repoRoot, 'pnpm-workspace.yaml');
  let content = fs.readFileSync(wsPath, 'utf8');
  const quoted = `"${relPath.replace(/\\/g, '/')}"`;
  if (content.includes(quoted)) {
    return { changed: false, content };
  }
  const lines = content.split(/\r?\n/);
  const idx = lines.findIndex((l) => l.trim() === 'packages:');
  if (idx < 0) {
    throw new Error('pnpm-workspace.yaml: missing top-level packages: key');
  }
  let insertAt = idx + 1;
  while (insertAt < lines.length && /^\s*-\s/.test(lines[insertAt]!)) {
    insertAt += 1;
  }
  const indent = '  ';
  lines.splice(insertAt, 0, `${indent}- ${quoted}`);
  return { changed: true, content: lines.join('\n') + (content.endsWith('\n') ? '' : '\n') };
}

export function runVendorAdd(opts: VendorAddOptions): void {
  const { cloneUrl, repo } = parseGithubRepo(opts.url);
  const dirName = sanitizeVendorDir(opts.name?.trim() || repo);
  const relVendor = path.posix.join('vendor', dirName);
  const absVendor = path.join(opts.repoRoot, ...relVendor.split('/'));

  console.log(`Vendor target: ${relVendor}`);
  console.log(`Clone URL: ${cloneUrl}`);
  console.log('');
  console.log('Next steps (npm / private packages):');
  console.log('  • If the dependency uses GitHub Packages, use root scripts: pnpm run package:token (see package.json package:*).');
  console.log('  • Add a root or package .npmrc only when a registry scope requires it — do not commit secrets.');
  console.log('');

  if (!opts.apply) {
    console.log('Dry run (no git / disk changes). Re-run with --apply to execute.');
    console.log(`  git submodule add ${cloneUrl} ${relVendor}`);
    console.log(`  (then) append workspace package: ${relVendor}`);
    return;
  }

  if (fs.existsSync(absVendor)) {
    console.error(`Path already exists: ${absVendor}`);
    process.exit(1);
  }

  const vendorParent = path.dirname(absVendor);
  if (!fs.existsSync(vendorParent)) {
    fs.mkdirSync(vendorParent, { recursive: true });
  }

  const git = spawnSync('git', ['submodule', 'add', cloneUrl, relVendor], {
    cwd: opts.repoRoot,
    stdio: 'inherit',
    shell: false,
  });
  if ((git.status ?? 1) !== 0) {
    process.exit(git.status ?? 1);
  }

  const { changed, content } = ensureWorkspaceEntry(opts.repoRoot, relVendor);
  if (changed) {
    fs.writeFileSync(path.join(opts.repoRoot, 'pnpm-workspace.yaml'), content, 'utf8');
    console.log(`Updated pnpm-workspace.yaml with ${relVendor}`);
  } else {
    console.log('pnpm-workspace.yaml already lists this path.');
  }

  console.log('');
  console.log('Run pnpm install from the repo root, then add the package to apps/portfolio or other consumers as needed.');
}
