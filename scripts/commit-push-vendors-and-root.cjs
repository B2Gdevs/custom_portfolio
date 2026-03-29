#!/usr/bin/env node
/**
 * Commit and push all git changes in vendor submodules (from .gitmodules), then
 * commit submodule pointer updates + any other root changes and push the main repo.
 *
 * Usage (from monorepo root):
 *   node scripts/commit-push-vendors-and-root.cjs -m "your message"
 *   node scripts/commit-push-vendors-and-root.cjs --dry-run
 *   node scripts/commit-push-vendors-and-root.cjs --vendors-only -m "vendor work"
 *   node scripts/commit-push-vendors-and-root.cjs --root-only -m "bump submodule pins"
 *
 * Notes:
 * - Submodules must be on a branch (not detached HEAD) to push; the script warns and skips push otherwise.
 * - Commits are skipped when there is nothing to commit in that repo.
 * - Uses your configured git remote/branch (git push, no forced refspec).
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function parseArgs(argv) {
  let message = '';
  let dryRun = false;
  let vendorsOnly = false;
  let rootOnly = false;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-m' || a === '--message') {
      message = argv[++i] || '';
    } else if (a === '--dry-run') {
      dryRun = true;
    } else if (a === '--vendors-only') {
      vendorsOnly = true;
    } else if (a === '--root-only') {
      rootOnly = true;
    } else if (a === '-h' || a === '--help') {
      console.log(`Usage: node scripts/commit-push-vendors-and-root.cjs -m "commit message" [options]

Options:
  -m, --message <text>   Commit message (required unless --dry-run)
  --dry-run              Print steps only; do not run git write/network
  --vendors-only         Only submodules; do not commit/push root
  --root-only            Only root repo (still updates submodule dirs on disk if you edited them manually)
  -h, --help             This help
`);
      process.exit(0);
    }
  }
  if (!dryRun && !message.trim()) {
    console.error('Error: provide -m "commit message" (or use --dry-run).');
    process.exit(1);
  }
  if (vendorsOnly && rootOnly) {
    console.error('Error: use only one of --vendors-only or --root-only.');
    process.exit(1);
  }
  return { message: message.trim(), dryRun, vendorsOnly, rootOnly };
}

function sh(cwd, cmd, dryRun) {
  const label = path.relative(ROOT, cwd) || '.';
  console.log(`\n━━ ${label} ━━\n$ ${cmd}`);
  if (dryRun) return 0;
  const r = spawnSync(cmd, { cwd, shell: true, stdio: 'inherit' });
  return r.status ?? 1;
}

function exec(cwd, cmd) {
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function parseSubmodulePaths(repoRoot) {
  const gm = path.join(repoRoot, '.gitmodules');
  if (!fs.existsSync(gm)) return [];
  const text = fs.readFileSync(gm, 'utf8');
  const paths = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*path\s*=\s*(.+)\s*$/);
    if (m) paths.push(m[1].trim());
  }
  return paths;
}

function isGitRepo(dir) {
  return fs.existsSync(path.join(dir, '.git'));
}

function porcelainEmpty(cwd, dryRun) {
  try {
    const out = exec(cwd, 'git status --porcelain', dryRun);
    return !out;
  } catch {
    return true;
  }
}

function currentBranch(cwd, dryRun) {
  try {
    return exec(cwd, 'git rev-parse --abbrev-ref HEAD', dryRun);
  } catch {
    return 'HEAD';
  }
}

function commitAllIfNeeded(cwd, message, dryRun) {
  if (porcelainEmpty(cwd)) {
    console.log('(clean — nothing to commit)');
    return 0;
  }
  if (dryRun) {
    console.log(`Would run: git add -A && git commit -m ${JSON.stringify(message)}`);
    return 0;
  }
  let st = sh(cwd, 'git add -A', false);
  if (st !== 0) return st;
  const still = exec(cwd, 'git diff --cached --stat', false);
  if (!still) {
    console.log('(nothing staged after add — skip commit)');
    return 0;
  }
  st = sh(cwd, `git commit -m ${JSON.stringify(message)}`, false);
  return st !== 0 ? st : 0;
}

function pushIfPossible(cwd, dryRun) {
  const branch = currentBranch(cwd);
  if (branch === 'HEAD') {
    console.warn('⚠ Detached HEAD — skip push. Checkout a branch in this repo first.');
    return 0;
  }
  if (dryRun) {
    console.log(`Would run: git push (branch ${branch})`);
    return 0;
  }
  return sh(cwd, 'git push', false);
}

function main() {
  const opts = parseArgs(process.argv);

  if (!fs.existsSync(path.join(ROOT, '.git'))) {
    console.error('Run from monorepo root (directory containing .git).');
    process.exit(1);
  }

  const subPaths = parseSubmodulePaths(ROOT);
  if (subPaths.length === 0) {
    console.warn('No submodules found in .gitmodules.');
  }

  if (!opts.rootOnly) {
    for (const rel of subPaths) {
      const subRoot = path.join(ROOT, rel);
      if (!fs.existsSync(subRoot)) {
        console.warn(`⚠ Skip missing path: ${rel}`);
        continue;
      }
      if (!isGitRepo(subRoot)) {
        console.warn(`⚠ Skip (not a git repo): ${rel}`);
        continue;
      }
      console.log(`\n▶ Submodule: ${rel}`);
      let st = commitAllIfNeeded(subRoot, opts.message, opts.dryRun);
      if (st !== 0) process.exit(st);
      st = pushIfPossible(subRoot, opts.dryRun);
      if (st !== 0) process.exit(st);
    }
  }

  if (!opts.vendorsOnly) {
    console.log(`\n▶ Main repo (root)`);
    let st = commitAllIfNeeded(ROOT, opts.message, opts.dryRun);
    if (st !== 0) process.exit(st);
    st = pushIfPossible(ROOT, opts.dryRun);
    if (st !== 0) process.exit(st);
  }

  console.log('\n✓ Done.');
}

main();
