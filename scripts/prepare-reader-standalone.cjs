const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'apps', 'portfolio');
const buildsRootDir = path.join(appDir, '.reader-builds', 'portfolio-reader');
const buildsManifestPath = path.join(buildsRootDir, 'manifest.json');

function formatDatePart(value) {
  return String(value).padStart(2, '0');
}

function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return 'nogit';
  }
}

function createBuildId() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    formatDatePart(now.getMonth() + 1),
    formatDatePart(now.getDate()),
  ].join('');
  const time = [
    formatDatePart(now.getHours()),
    formatDatePart(now.getMinutes()),
    formatDatePart(now.getSeconds()),
  ].join('');

  return `${stamp}-${time}-${getGitCommit()}`;
}

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

function runWorkspaceBuild(distDirRelative) {
  const packageManagerEntrypoint = process.env.npm_execpath;
  if (!packageManagerEntrypoint) {
    throw new Error('npm_execpath is not set. Run this script through pnpm.');
  }

  const entryExt = path.extname(packageManagerEntrypoint).toLowerCase();
  const command = entryExt === '.js' || entryExt === '.cjs' ? process.execPath : packageManagerEntrypoint;
  const commandArgs =
    command === process.execPath
      ? [packageManagerEntrypoint, 'run', 'build', '--workspace=@portfolio/app']
      : ['run', 'build', '--workspace=@portfolio/app'];

  const result = spawnSync(command, commandArgs, {
    cwd: rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORTFOLIO_DIST_DIR: distDirRelative,
    },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const buildId = process.env.READER_BUILD_ID || createBuildId();
const distDirRelative = path.join('.reader-builds', 'portfolio-reader', buildId).replace(/\\/g, '/');
const versionedOutputDir = path.join(buildsRootDir, buildId);

fs.rmSync(versionedOutputDir, { recursive: true, force: true });
fs.mkdirSync(buildsRootDir, { recursive: true });

runWorkspaceBuild(distDirRelative);

const buildManifest = readBuildManifest();
const builds = Array.isArray(buildManifest.builds)
  ? buildManifest.builds.filter((entry) => entry && entry.id !== buildId)
  : [];
builds.unshift({
  id: buildId,
  createdAt: new Date().toISOString(),
  path: path.relative(rootDir, versionedOutputDir).replace(/\\/g, '/'),
  distDir: distDirRelative,
});

fs.writeFileSync(
  buildsManifestPath,
  JSON.stringify(
    {
      latestBuildId: buildId,
      builds,
    },
    null,
    2
  ) + '\n',
  'utf8'
);

console.log(`Versioned reader build saved as ${path.relative(rootDir, versionedOutputDir)}`);
console.log(`Latest reader build id: ${buildId}`);
