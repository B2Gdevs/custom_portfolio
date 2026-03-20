const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '3410';
process.env.HOSTNAME = process.env.HOSTNAME || '127.0.0.1';
process.chdir(__dirname);

const nextBinCandidates = [
  path.join(__dirname, '..', '..', 'apps', 'portfolio', 'node_modules', 'next', 'dist', 'bin', 'next'),
  path.join(__dirname, '..', '..', 'node_modules', 'next', 'dist', 'bin', 'next'),
];
const nextBin = nextBinCandidates.find((candidate) => fs.existsSync(candidate));

if (!nextBin) {
  console.error('Unable to find the Next.js runtime. Run pnpm install in the repo root first.');
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, 'start', '-p', process.env.PORT, '-H', process.env.HOSTNAME], {
  cwd: __dirname,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
