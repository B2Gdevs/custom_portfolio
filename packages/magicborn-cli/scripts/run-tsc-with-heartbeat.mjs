import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const repoRoot = path.resolve(root, '..', '..');
const pkgName = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).name;
const req = createRequire(path.join(root, 'package.json'));
const requireRepo = createRequire(import.meta.url);
const { appendInstallHookLog, stderrLine } = requireRepo(
  path.join(repoRoot, 'scripts', 'install-hook-log.cjs'),
);

let tscScript;
try {
  tscScript = req.resolve('typescript/bin/tsc');
} catch {
  tscScript = null;
}

const tscArgs = ['-p', 'tsconfig.json'];
appendInstallHookLog(`[${pkgName}] prepare: spawning tsc`);
const child = tscScript
  ? spawn(process.execPath, [tscScript, ...tscArgs], { cwd: root, stdio: 'inherit' })
  : spawn('tsc', tscArgs, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });

const HEARTBEAT_MS = 30_000;
let finished = false;
let tick = 0;
const id = setInterval(() => {
  if (!finished) {
    tick += 1;
    appendInstallHookLog(`[${pkgName}] prepare: tsc heartbeat #${tick} (~${(tick * HEARTBEAT_MS) / 1000}s)`);
    stderrLine(
      `[${pkgName}] prepare: \`tsc\` still running (${HEARTBEAT_MS / 1000}s tick #${tick}). Log: .tmp/pnpm-install-hooks.log`,
    );
  }
}, HEARTBEAT_MS);

child.on('exit', (code, signal) => {
  finished = true;
  clearInterval(id);
  appendInstallHookLog(`[${pkgName}] prepare: tsc exited code=${code} signal=${signal ?? ''}`);
  process.exit(code ?? (signal ? 1 : 0));
});

child.on('error', (err) => {
  finished = true;
  clearInterval(id);
  appendInstallHookLog(`[${pkgName}] prepare: tsc spawn error ${err.message}`);
  stderrLine(String(err));
  process.exit(1);
});
