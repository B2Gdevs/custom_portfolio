const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'apps', 'portfolio');
const buildsRootDir = path.join(appDir, '.reader-builds', 'portfolio-reader');
const buildsManifestPath = path.join(buildsRootDir, 'manifest.json');
const nextBin = path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next');

function readBuildManifest() {
  if (!fs.existsSync(buildsManifestPath)) {
    return { latestBuildId: null, builds: [] };
  }

  try {
    return JSON.parse(fs.readFileSync(buildsManifestPath, 'utf8'));
  } catch {
    return { latestBuildId: null, builds: [] };
  }
}

function printBuilds() {
  const manifest = readBuildManifest();
  if (!manifest.builds?.length) {
    console.log('No frozen reader builds found. Run `pnpm build:reader` first.');
    return;
  }

  console.log(`Latest build: ${manifest.latestBuildId ?? 'unknown'}`);
  for (const build of manifest.builds) {
    const label = build.id === manifest.latestBuildId ? ' (latest)' : '';
    console.log(`${build.id}${label}  ${build.createdAt ?? ''}`);
  }
}

const args = process.argv.slice(2);
const listRequested = args.includes('--list') || args.includes('list');
const latestRequested = args.includes('--latest') || args.includes('latest');

if (listRequested) {
  printBuilds();
  process.exit(0);
}

const buildIndex = args.findIndex((arg) => arg === '--build');
const positionalBuildId = args.find(
  (arg) => !arg.startsWith('--') && arg !== 'list' && arg !== 'latest'
);
const requestedBuildId =
  buildIndex >= 0 && buildIndex + 1 < args.length
    ? args[buildIndex + 1]
    : positionalBuildId ?? (latestRequested ? 'latest' : null);
const manifest = readBuildManifest();
const selectedBuildId =
  requestedBuildId && requestedBuildId !== 'latest'
    ? requestedBuildId
    : manifest.latestBuildId;
const selectedBuild = manifest.builds?.find((build) => build.id === selectedBuildId);

if (!selectedBuild || !selectedBuild.distDir) {
  console.error(
    selectedBuildId
      ? `Reader build \`${selectedBuildId}\` not found. Run \`pnpm reader:list\` to see available builds.`
      : 'No frozen reader build is registered yet. Run `pnpm build:reader` first.'
  );
  process.exit(1);
}

if (!fs.existsSync(nextBin)) {
  console.error('Next.js runtime not found in apps/portfolio/node_modules. Run `pnpm install` first.');
  process.exit(1);
}

const readerPort = process.env.READER_PORT || process.env.PORT || '3410';
const readerHost = process.env.READER_HOST || '127.0.0.1';
const child = spawn(
  process.execPath,
  [nextBin, 'start', '-p', readerPort, '-H', readerHost],
  {
    cwd: appDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORTFOLIO_DIST_DIR: selectedBuild.distDir,
      PORT: readerPort,
      HOSTNAME: readerHost,
    },
  }
);

const forwardSignal = (signal) => {
  try {
    child.kill(signal);
  } catch {}
};

process.on('SIGINT', () => forwardSignal('SIGINT'));
process.on('SIGTERM', () => forwardSignal('SIGTERM'));

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
