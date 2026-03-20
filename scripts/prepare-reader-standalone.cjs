const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'apps', 'portfolio');
const buildSourceDir = path.join(appDir, '.next');
const publicSourceDir = path.join(appDir, 'public');
const outputDir = path.join(rootDir, '.standalone', 'portfolio-reader');

function assertExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`${label} not found at ${targetPath}. Run the app build first.`);
  }
}

function copyDirectory(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true, force: true });
}

assertExists(buildSourceDir, 'Next build output');

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

copyDirectory(buildSourceDir, path.join(outputDir, '.next'));

if (fs.existsSync(publicSourceDir)) {
  copyDirectory(publicSourceDir, path.join(outputDir, 'public'));
}

fs.writeFileSync(
  path.join(outputDir, 'package.json'),
  JSON.stringify(
    {
      name: 'portfolio-reader-standalone',
      private: true,
      scripts: {
        start: 'node server.cjs',
      },
    },
    null,
    2
  ) + '\n',
  'utf8'
);

fs.writeFileSync(
  path.join(outputDir, 'server.cjs'),
  [
    "const { spawn } = require('child_process');",
    "const fs = require('fs');",
    "const path = require('path');",
    '',
    "process.env.NODE_ENV = 'production';",
    "process.env.PORT = process.env.PORT || '3410';",
    "process.env.HOSTNAME = process.env.HOSTNAME || '127.0.0.1';",
    'process.chdir(__dirname);',
    '',
    'const nextBinCandidates = [',
    "  path.join(__dirname, '..', '..', 'apps', 'portfolio', 'node_modules', 'next', 'dist', 'bin', 'next'),",
    "  path.join(__dirname, '..', '..', 'node_modules', 'next', 'dist', 'bin', 'next'),",
    '];',
    'const nextBin = nextBinCandidates.find((candidate) => fs.existsSync(candidate));',
    '',
    'if (!nextBin) {',
    "  console.error('Unable to find the Next.js runtime. Run pnpm install in the repo root first.');",
    '  process.exit(1);',
    '}',
    '',
    "const child = spawn(process.execPath, [nextBin, 'start', '-p', process.env.PORT, '-H', process.env.HOSTNAME], {",
    '  cwd: __dirname,',
    "  stdio: 'inherit',",
    '  env: process.env,',
    '});',
    '',
    "child.on('exit', (code, signal) => {",
    '  if (signal) {',
    '    process.kill(process.pid, signal);',
    '    return;',
    '  }',
    '  process.exit(code ?? 0);',
    '});',
    '',
  ].join('\n'),
  'utf8'
);

console.log(`Standalone reader prepared at ${outputDir}`);
